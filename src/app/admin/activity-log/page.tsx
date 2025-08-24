'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityLogTable } from '../components/activity-table';
import { useActivityLogStats, useSecurityAlerts } from '../hooks/use-activity-logs';
import { Shield, Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';

// Statistics Card Component
function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend 
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className={`text-xs flex items-center mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↗' : '↘'} {Math.abs(trend.value)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Security Alerts Component
function SecurityAlertsPanel() {
  const { alerts, isLoading, error, markAsResolved } = useSecurityAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Loading security alerts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load security alerts: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts.filter(alert => !alert.resolved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Alerts
          {activeAlerts.length > 0 && (
            <Badge variant="destructive">{activeAlerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No active security alerts
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map(alert => (
              <div 
                key={alert.alertId}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        alert.severity === 'HIGH' || alert.severity === 'CRITICAL' 
                          ? 'destructive' 
                          : 'secondary'
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-sm font-medium">{alert.alertType}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => markAsResolved(alert.alertId)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Resolve
                </button>
              </div>
            ))}
            {activeAlerts.length > 5 && (
              <div className="text-xs text-muted-foreground text-center">
                +{activeAlerts.length - 5} more alerts
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Activity Log Admin Page
export function ActivityLogAdminPage() {
  const { stats, isLoading: statsLoading, error: statsError } = useActivityLogStats();
  const [selectedTab, setSelectedTab] = React.useState('overview');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Log Monitor</h1>
          <p className="text-muted-foreground">
            Monitor user activities and security events across the system
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load statistics: {statsError}
              </AlertDescription>
            </Alert>
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Activities"
                value={stats.totalActivities.toLocaleString()}
                description="All recorded activities"
                icon={Activity}
              />
              <StatsCard
                title="Unique Users"
                value={stats.uniqueUsers.toLocaleString()}
                description="Active users today"
                icon={Users}
              />
              <StatsCard
                title="Success Rate"
                value={`${Math.round((stats.successfulActions / (stats.successfulActions + stats.failedActions)) * 100)}%`}
                description="Successful operations"
                icon={TrendingUp}
              />
              <StatsCard
                title="Today's Activities"
                value={stats.todayActivities.toLocaleString()}
                description="Activities in last 24h"
                icon={Activity}
              />
            </div>
          ) : null}

          {/* Recent Activity Summary */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Top Actions</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-2">
                    {Object.entries(stats.actionCounts)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([action, count]) => (
                        <div key={action} className="flex justify-between items-center">
                          <span className="text-sm">{action.replace(/_/g, ' ')}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Types */}
            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-2">
                    {Object.entries(stats.userTypeCounts)
                      .sort(([,a], [,b]) => b - a)
                      .map(([userType, count]) => (
                        <div key={userType} className="flex justify-between items-center">
                          <span className="text-sm">{userType.replace(/_/g, ' ').toUpperCase()}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts */}
          <SecurityAlertsPanel />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogTable
            refreshInterval={120000} // Auto-refresh every 120 seconds
            showExportButton={true}
            showRefreshButton={true}
            title="All Activity Logs"
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Failed Logins */}
          <ActivityLogTable
            filters={{
              actions: ['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS'],
              limit: 100
            }}
            title="Security Events"
            refreshInterval={10000} // More frequent refresh for security events
          />

          {/* Security Alerts Detail */}
          <SecurityAlertsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ActivityLogAdminPage;