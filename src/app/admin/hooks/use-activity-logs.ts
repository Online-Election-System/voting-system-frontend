import { useState, useEffect, useCallback } from 'react';

// Import the ActivityLog type
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

// Types for API filters
export interface ActivityLogFilter {
  userId?: string;
  userType?: string;
  actions?: string[];
  statuses?: string[];
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  endpoint?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityLogStats {
  totalActivities: number;
  uniqueUsers: number;
  successfulActions: number;
  failedActions: number;
  todayActivities: number;
  actionCounts: Record<string, number>;
  userTypeCounts: Record<string, number>;
  hourlyActivity: Record<string, number>;
}

export interface SecurityAlert {
  alertId: string;
  alertType: string;
  userId?: string;
  ipAddress?: string;
  description: string;
  timestamp: string;
  severity: string;
  resolved: boolean;
}

// Get API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Hook for fetching activity logs
export function useActivityLogs(filters?: ActivityLogFilter) {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.userType) queryParams.append('userType', filters.userType);
      if (filters?.actions?.length) {
        filters.actions.forEach(action => queryParams.append('action', action));
      }
      if (filters?.statuses?.length) {
        filters.statuses.forEach(status => queryParams.append('status', status));
      }
      if (filters?.startTime) queryParams.append('startTime', filters.startTime);
      if (filters?.endTime) queryParams.append('endTime', filters.endTime);
      if (filters?.endpoint) queryParams.append('endpoint', filters.endpoint);
      if (filters?.ipAddress) queryParams.append('ipAddress', filters.ipAddress);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const url = `${API_BASE_URL}/admin/api/v1/logs?${queryParams.toString()}`;
      console.log('Fetching activity logs from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Failed to fetch activity logs: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Activity logs response:', result);
      
      // Handle both array response and object with data property
      if (Array.isArray(result)) {
        setData(result);
        setTotalCount(result.length);
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
        setTotalCount(result.totalCount || result.data.length);
      } else {
        console.warn('Unexpected response format:', result);
        setData([]);
        setTotalCount(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity logs';
      setError(errorMessage);
      console.error('Error fetching activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const refetch = useCallback(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    refetch,
  };
}

// Hook for fetching activity log statistics
export function useActivityLogStats(timeRange?: { startTime?: string; endTime?: string }) {
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (timeRange?.startTime) queryParams.append('startTime', timeRange.startTime);
      if (timeRange?.endTime) queryParams.append('endTime', timeRange.endTime);

      const url = `${API_BASE_URL}/admin/api/v1/stats?${queryParams.toString()}`;
      console.log('Fetching activity stats from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats response error:', response.status, errorText);
        throw new Error(`Failed to fetch activity stats: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Activity stats response:', result);
      setStats(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity stats';
      setError(errorMessage);
      console.error('Error fetching activity stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}

// Hook for fetching security alerts
export function useSecurityAlerts(since?: string) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (since) queryParams.append('since', since);

      const url = `${API_BASE_URL}/admin/api/v1/security-alerts?${queryParams.toString()}`;
      console.log('Fetching security alerts from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Security alerts response error:', response.status, errorText);
        throw new Error(`Failed to fetch security alerts: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Security alerts response:', result);
      
      // Handle both array response and object with data property
      if (Array.isArray(result)) {
        setAlerts(result);
      } else if (result.data && Array.isArray(result.data)) {
        setAlerts(result.data);
      } else {
        console.warn('Unexpected security alerts response format:', result);
        setAlerts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch security alerts';
      setError(errorMessage);
      console.error('Error fetching security alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [since]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const refetch = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markAsResolved = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/api/v1/security-alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve alert: ${response.statusText}`);
      }

      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.alertId === alertId 
            ? { ...alert, resolved: true }
            : alert
        )
      );
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  }, []);

  return {
    alerts,
    isLoading,
    error,
    refetch,
    markAsResolved,
  };
}

// Hook for exporting activity logs
export function useActivityLogExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportLogs = useCallback(async (
    filters?: ActivityLogFilter,
    format: 'csv' | 'json' = 'csv'
  ) => {
    try {
      setIsExporting(true);

      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.userType) queryParams.append('userType', filters.userType);
      if (filters?.actions?.length) {
        filters.actions.forEach(action => queryParams.append('action', action));
      }
      if (filters?.statuses?.length) {
        filters.statuses.forEach(status => queryParams.append('status', status));
      }
      if (filters?.startTime) queryParams.append('startTime', filters.startTime);
      if (filters?.endTime) queryParams.append('endTime', filters.endTime);
      if (filters?.endpoint) queryParams.append('endpoint', filters.endpoint);
      if (filters?.ipAddress) queryParams.append('ipAddress', filters.ipAddress);

      const url = `${API_BASE_URL}/admin/api/v1/logs/export?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to export activity logs: ${response.statusText}`);
      }

      // Create download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error exporting activity logs:', err);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportLogs,
    isExporting,
  };
}
