import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useTableSearch, 
  SearchInput, 
  FilterControls, 
  FilterSelect, 
  SortableHeader, 
  ResultsSummary, 
  TablePagination,
  FilterOption 
} from '@/components/shared/table';
import { ActivityLogDetail } from './activity-modal';
import { useActivityLogs, useActivityLogExport, ActivityLogFilter } from '../hooks/use-activity-logs';
import { Eye, Download, RefreshCw, AlertTriangle } from 'lucide-react';

// Activity Log interface matching the backend structure
export interface ActivityLog {
  id: string;
  userId?: string;
  userType?: string;
  userFullName?: string; // Resolved from user tables
  action: string;
  resourceId?: string;
  httpMethod?: string;
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string; // ISO string from backend
  status: string; // SUCCESS, FAILURE, ERROR, PENDING
  details?: string;
  sessionId?: string;
}

interface ActivityLogTableProps {
  filters?: ActivityLogFilter;
  refreshInterval?: number; // Auto-refresh interval in milliseconds
  showExportButton?: boolean;
  showRefreshButton?: boolean;
  title?: string;
}

export function ActivityLogTable({ 
  filters: externalFilters,
  refreshInterval,
  showExportButton = true,
  showRefreshButton = true,
  title = "Activity Log"
}: ActivityLogTableProps) {
  const { data, isLoading, error, totalCount, refetch } = useActivityLogs(externalFilters);
  const { exportLogs, isExporting } = useActivityLogExport();

  // Auto-refresh functionality
  React.useEffect(() => {
    if (!refreshInterval) return;
    
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval, refetch]);

  const {
    searchQuery,
    filters,
    sortConfig,
    currentPage,
    filteredData,
    paginatedData,
    totalPages,
    hasActiveFilters,
    setSearchQuery,
    setCurrentPage,
    updateFilter,
    updateSort,
    clearFilters,
  } = useTableSearch(
    data,
    ['userFullName', 'action', 'endpoint', 'ipAddress', 'details'], // searchable fields
    20 // items per page
  );

  // Handle export
  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      await exportLogs({
        ...externalFilters,
        // Apply current filters from the table
        ...(filters.userType !== 'all' && { userType: filters.userType }),
        ...(filters.action !== 'all' && { actions: [filters.action] }),
        ...(filters.status !== 'all' && { statuses: [filters.status] }),
        ...(filters.httpMethod !== 'all' && { httpMethod: filters.httpMethod }),
      }, format);
    } catch (err) {
      console.error('Export failed:', err);
      // You might want to show a toast notification here
    }
  };

  // Filter options
  const userTypeOptions: FilterOption[] = [
    { label: 'Chief Occupant', value: 'chief_occupant' },
    { label: 'Verified Chief Occupant', value: 'verified_chief_occupant' },
    { label: 'Household Member', value: 'household_member' },
    { label: 'Verified Household Member', value: 'verified_household_member' },
    { label: 'Government Official', value: 'government_official' },
    { label: 'Election Commission', value: 'election_commission' },
    { label: 'Polling Station', value: 'polling_station' },
    { label: 'Admin', value: 'admin' },
  ];

  const actionOptions: FilterOption[] = [
    { label: 'Login Attempt', value: 'LOGIN_ATTEMPT' },
    { label: 'Login Success', value: 'LOGIN_SUCCESS' },
    { label: 'Login Failure', value: 'LOGIN_FAILURE' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'Password Change', value: 'PASSWORD_CHANGE' },
    { label: 'Voter Registration', value: 'VOTER_REGISTRATION' },
    { label: 'Vote Cast', value: 'VOTE_CAST' },
    { label: 'Election Created', value: 'ELECTION_CREATED' },
    { label: 'Election Updated', value: 'ELECTION_UPDATED' },
    { label: 'Candidate Created', value: 'CANDIDATE_CREATED' },
    { label: 'User Created', value: 'USER_CREATED' },
    { label: 'Unauthorized Access', value: 'UNAUTHORIZED_ACCESS' },
    { label: 'Data Export', value: 'DATA_EXPORT' },
  ];

  const statusOptions: FilterOption[] = [
    { label: 'Success', value: 'SUCCESS' },
    { label: 'Failure', value: 'FAILURE' },
    { label: 'Error', value: 'ERROR' },
    { label: 'Pending', value: 'PENDING' },
  ];

  const httpMethodOptions: FilterOption[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
  ];

  // Helper functions
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILURE':
        return 'destructive';
      case 'ERROR':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('LOGIN_SUCCESS')) return 'default';
    if (action.includes('LOGIN_FAILURE') || action.includes('UNAUTHORIZED')) return 'destructive';
    if (action.includes('CREATED') || action.includes('REGISTRATION')) return 'default';
    if (action.includes('UPDATED') || action.includes('CHANGE')) return 'secondary';
    return 'outline';
  };

  const truncateText = (text: string | undefined, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {showRefreshButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load activity logs: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading activity logs...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            {showExportButton && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </>
            )}
            {showRefreshButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users, actions, endpoints..."
          />
          
          <FilterControls
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          >
            <FilterSelect
              label="User Type"
              value={filters.userType || 'all'}
              options={userTypeOptions}
              onChange={(value) => updateFilter('userType', value)}
            />
            
            <FilterSelect
              label="Action"
              value={filters.action || 'all'}
              options={actionOptions}
              onChange={(value) => updateFilter('action', value)}
            />
            
            <FilterSelect
              label="Status"
              value={filters.status || 'all'}
              options={statusOptions}
              onChange={(value) => updateFilter('status', value)}
            />
            
            <FilterSelect
              label="HTTP Method"
              value={filters.httpMethod || 'all'}
              options={httpMethodOptions}
              onChange={(value) => updateFilter('httpMethod', value)}
            />
          </FilterControls>
        </div>
        
        <ResultsSummary
          hasActiveFilters={hasActiveFilters}
          filteredCount={filteredData.length}
          totalCount={data.length}
          itemName="activity logs"
        />
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">
                  <SortableHeader
                    field="timestamp"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Timestamp
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="userFullName"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    User
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="userType"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    User Type
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="action"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Action
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="status"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Status
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="httpMethod"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Method
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="endpoint"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    Endpoint
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader
                    field="ipAddress"
                    currentSort={sortConfig}
                    onSort={updateSort}
                  >
                    IP Address
                  </SortableHeader>
                </TableHead>
                <TableHead className="w-[200px]">Details</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    {hasActiveFilters ? 'No activity logs match your filters' : 'No activity logs found'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {log.userFullName || 'Unknown User'}
                        </div>
                        {log.userId && (
                          <div className="text-xs text-muted-foreground">
                            ID: {log.userId.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.userType ? (
                        <Badge variant="outline" className="text-xs">
                          {log.userType.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getActionBadgeVariant(log.action)}
                        className="text-xs"
                      >
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(log.status)}
                        className="text-xs"
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.httpMethod ? (
                        <Badge variant="outline" className="text-xs">
                          {log.httpMethod}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={log.endpoint}>
                        {log.endpoint}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-mono">
                        {log.ipAddress || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div 
                        className="text-xs text-muted-foreground truncate"
                        title={log.details}
                      >
                        {truncateText(log.details)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActivityLogDetail 
                        log={log}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={20}
          onPageChange={setCurrentPage}
          itemName="activity logs"
        />
      </CardContent>
    </Card>
  );
}