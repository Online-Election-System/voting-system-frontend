"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Check, X, Search, Filter, FileText, Download, ImageIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getApplications, getApplicationCounts, reviewApplication } from "../lib/api"
import { RegistrationApplication, StatusCounts } from "../lib/types"

export default function Registrations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // State to hold data from the API
  const [applications, setApplications] = useState<RegistrationApplication[]>([])
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [appsData, countsData] = await Promise.all([
        getApplications(searchTerm, statusFilter),
        getApplicationCounts()
      ]);
      setApplications(appsData);
      setCounts(countsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter]);

  const handleReviewAction = async (nic: string, status: 'approved' | 'rejected') => {
    try {
        await reviewApplication(nic, status);
        // Refresh data to show updated status
        fetchData(); 
    } catch (err: any) {
        alert(`Failed to ${status} application: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-red-600 flex items-center gap-2"><AlertCircle/> {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voter Registrations</h1>
        <p className="text-gray-600">Review and approve voter registration applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="w-4 h-4" />Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or NIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-800">{counts.pending}</div><p className="text-sm text-gray-600">Pending Review</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-800">{counts.approved}</div><p className="text-sm text-gray-600">Approved</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-800">{counts.rejected}</div><p className="text-sm text-gray-600">Rejected</p></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold text-gray-800">{counts.total}</div><p className="text-sm text-gray-600">Total Applications</p></CardContent></Card>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Applications</CardTitle>
          <CardDescription>{isLoading ? 'Loading...' : `${applications.length} applications found`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Full Name</TableHead><TableHead>NIC</TableHead><TableHead>Phone</TableHead><TableHead>Address</TableHead><TableHead>NIC Document</TableHead><TableHead>Photo</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center">Loading...</TableCell></TableRow>
              ) : applications.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center">No applications found.</TableCell></TableRow>
              ) : (
                applications.map((registration) => (
                  <TableRow key={registration.nic}>
                    <TableCell className="font-medium">{registration.fullName}</TableCell>
                    <TableCell>{registration.nic}</TableCell>
                    <TableCell>{registration.phone || '-'}</TableCell>
                    <TableCell className="max-w-48 truncate">{registration.address}</TableCell>
                    <TableCell>
                      {registration.idCopyPath ? (
                        <div className="flex gap-1"><FileText className="w-4 h-4 text-gray-500"/> Document Available</div>
                      ) : (
                        <span className="text-red-500 text-sm">No document</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {registration.imagePath ? (
                        <div className="flex gap-1"><ImageIcon className="w-4 h-4 text-gray-500"/> Photo Available</div>
                      ) : (
                        <span className="text-red-500 text-sm">No photo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={registration.status === 'pending' ? 'secondary' : registration.status === 'approved' ? 'default' : 'destructive'}>{registration.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(registration.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="ghost"><Link href={`/registrations/${registration.nic}`}><Eye className="w-4 h-4" /></Link></Button>
                        {registration.status === "pending" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleReviewAction(registration.nic, 'approved')}><Check className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleReviewAction(registration.nic, 'rejected')}><X className="w-4 h-4" /></Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}