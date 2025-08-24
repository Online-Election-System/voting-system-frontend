"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Home,
  BarChart3,
  Download,
  Loader2,
  ChartPie
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8080/api/v1";

// Color schemes for professional charts
const COLORS = {
  primary: '#3B82F6', // Blue
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  danger: '#EF4444',  // Red
  purple: '#8B5CF6',
  teal: '#14B8A6',
  gray: '#6B7280'
};

const STATUS_COLORS = [COLORS.warning, COLORS.success, COLORS.danger];

interface AnalyticsData {
  registrations: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  addMemberRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  removalRequests: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  households: {
    totalHouseholds: number;
    totalMembers: number;
    averageSize: number;
  };
  eligibleVoters: number;
}

export default function AnalyticsReports() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        registrationsResponse,
        addMemberResponse,
        removalResponse,
        householdsResponse,
        eligibleVotersResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/registrations/counts`),
        fetch(`${API_BASE_URL}/add-member-requests/counts`),
        fetch(`${API_BASE_URL}/removal-requests/counts`),
        fetch(`${API_BASE_URL}/households`),
        fetch(`${API_BASE_URL}/eligible-voters/count`)
      ]);

      const registrationsData = registrationsResponse.ok ? await registrationsResponse.json() : { pending: 0, approved: 0, rejected: 0, total: 0 };
      const addMemberData = addMemberResponse.ok ? await addMemberResponse.json() : { pending: 0, approved: 0, rejected: 0, total: 0 };
      const removalData = removalResponse.ok ? await removalResponse.json() : { pending: 0, approved: 0, rejected: 0, total: 0 };
      const householdsData = householdsResponse.ok ? await householdsResponse.json() : [];
      const eligibleVotersData = eligibleVotersResponse.ok ? await eligibleVotersResponse.json() : { count: 0 };

      const totalMembers = householdsData.reduce((sum: number, h: any) => sum + (h.totalMembers || 0), 0);
      const averageSize = householdsData.length > 0 ? Math.round((totalMembers / householdsData.length) * 10) / 10 : 0;

      setData({
        registrations: registrationsData,
        addMemberRequests: addMemberData,
        removalRequests: removalData,
        households: {
          totalHouseholds: householdsData.length,
          totalMembers,
          averageSize
        },
        eligibleVoters: eligibleVotersData.count || 0
      });
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error || 'No data available'}</div>
      </div>
    );
  }

  // Prepare chart data
  const requestStatusData = [
    {
      name: 'Registrations',
      pending: data.registrations.pending,
      approved: data.registrations.approved,
      rejected: data.registrations.rejected,
      total: data.registrations.total
    },
    {
      name: 'Add Members',
      pending: data.addMemberRequests.pending,
      approved: data.addMemberRequests.approved,
      rejected: data.addMemberRequests.rejected,
      total: data.addMemberRequests.total
    },
    {
      name: 'Removals',
      pending: data.removalRequests.pending,
      approved: data.removalRequests.approved,
      rejected: data.removalRequests.rejected,
      total: data.removalRequests.total
    }
  ];

  const overallStatusPieData = [
    { 
      name: 'Pending', 
      value: data.registrations.pending + data.addMemberRequests.pending + data.removalRequests.pending,
      color: COLORS.warning
    },
    { 
      name: 'Approved', 
      value: data.registrations.approved + data.addMemberRequests.approved + data.removalRequests.approved,
      color: COLORS.success
    },
    { 
      name: 'Rejected', 
      value: data.registrations.rejected + data.addMemberRequests.rejected + data.removalRequests.rejected,
      color: COLORS.danger
    }
  ];

  const populationData = [
    { name: 'Eligible Voters', value: data.eligibleVoters, color: COLORS.primary },
    { name: 'Total Members', value: data.households.totalMembers, color: COLORS.teal },
    { name: 'Total Households', value: data.households.totalHouseholds, color: COLORS.purple }
  ];

  // Calculate KPIs
  const totalProcessed = overallStatusPieData.reduce((sum, item) => sum + item.value, 0);
  const approvalRate = totalProcessed > 0 ? Math.round((overallStatusPieData.find(d => d.name === 'Approved')?.value || 0) / totalProcessed * 100) : 0;
  const voterCoverage = data.households.totalMembers > 0 ? Math.round(data.eligibleVoters / data.households.totalMembers * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics for your division</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-gray-900">
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="requests">Request Analysis</SelectItem>
                <SelectItem value="population">Population Metrics</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="text-gray-600 hover:bg-gray-100 border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Approval Rate</p>
                  <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voter Coverage</p>
                  <p className="text-3xl font-bold text-blue-600">{voterCoverage}%</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Household Size</p>
                  <p className="text-3xl font-bold text-purple-600">{data.households.averageSize}</p>
                </div>
                <Home className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {overallStatusPieData.find(d => d.name === 'Pending')?.value || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {selectedMetric === 'overview' && (
          <div className="flex justify-center">
            {/* Overall Status Distribution - Centered */}
            <Card className="bg-white shadow-md border border-gray-200 w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPie className="w-5 h-5 text-gray-700" />
                  Overall Request Status Distribution
                </CardTitle>
                <CardDescription>Distribution of all request statuses across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overallStatusPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallStatusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedMetric === 'requests' && (
          <div className="space-y-6">
            {/* Request Status Comparison */}
            <Card className="bg-white shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  Request Status Comparison by Category
                </CardTitle>
                <CardDescription>Compare approval, rejection, and pending rates across different request types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={requestStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill={COLORS.warning} name="Pending" />
                    <Bar dataKey="approved" stackId="a" fill={COLORS.success} name="Approved" />
                    <Bar dataKey="rejected" stackId="a" fill={COLORS.danger} name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Individual Request Type Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['registrations', 'addMemberRequests', 'removalRequests'].map((type, index) => {
                const typeData = data[type as keyof typeof data] as any;
                const pieData = [
                  { name: 'Pending', value: typeData.pending, color: COLORS.warning },
                  { name: 'Approved', value: typeData.approved, color: COLORS.success },
                  { name: 'Rejected', value: typeData.rejected, color: COLORS.danger }
                ];
                const titles = ['Voter Registrations', 'Add Member Requests', 'Removal Requests'];
                const icons = [UserCheck, UserPlus, UserMinus];
                const Icon = icons[index];

                return (
                  <Card key={type} className="bg-white shadow-md border border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="w-5 h-5 text-gray-700" />
                        {titles[index]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 space-y-2">
                        {pieData.map((entry, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-gray-600">{entry.name}</span>
                            </div>
                            <Badge variant="outline" className="text-gray-700">
                              {entry.value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {selectedMetric === 'population' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Population Distribution */}
            <Card className="bg-white shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  Population Distribution
                </CardTitle>
                <CardDescription>Breakdown of population by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={populationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {populationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Population Metrics */}
            <Card className="bg-white shadow-md border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-700" />
                  Household Metrics
                </CardTitle>
                <CardDescription>Key household and population statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Households</span>
                    <span className="text-2xl font-bold text-gray-900">{data.households.totalHouseholds}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Total Members</span>
                    <span className="text-2xl font-bold text-gray-900">{data.households.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Average Household Size</span>
                    <span className="text-2xl font-bold text-gray-900">{data.households.averageSize}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-blue-700 font-medium">Eligible Voters</span>
                    <span className="text-2xl font-bold text-blue-900">{data.eligibleVoters}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">Voter Coverage Rate</span>
                    <span className="text-2xl font-bold text-green-900">{voterCoverage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}