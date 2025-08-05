import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Eye, ExternalLink } from 'lucide-react';
import { ActivityLog } from './activity-table';

interface ActivityLogDetailProps {
  log: ActivityLog;
  trigger?: React.ReactNode;
}

export function ActivityLogDetail({ log, trigger }: ActivityLogDetailProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        full: format(date, 'EEEE, MMMM do, yyyy \'at\' HH:mm:ss'),
        iso: date.toISOString(),
        relative: format(date, 'MMM dd, yyyy HH:mm:ss')
      };
    } catch {
      return {
        full: 'Invalid date',
        iso: timestamp,
        relative: 'Invalid date'
      };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILURE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseUserAgent = (userAgent?: string) => {
    if (!userAgent) return null;
    
    // Simple user agent parsing (you might want to use a proper library)
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([0-9.]+)/);
    const osMatch = userAgent.match(/(Windows|Mac OS X|Linux|Android|iOS)/);
    
    return {
      browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : 'Unknown',
      os: osMatch ? osMatch[1] : 'Unknown',
      full: userAgent
    };
  };

  const timestamps = formatTimestamp(log.timestamp);
  const userAgentInfo = parseUserAgent(log.userAgent);

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Activity Log Details
            <Badge className={getStatusColor(log.status)}>
              {log.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Activity ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {log.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(log.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <div className="mt-1">
                    <div className="text-sm">{timestamps.full}</div>
                    <div className="text-xs text-muted-foreground">{timestamps.iso}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Session ID</label>
                  <div className="mt-1">
                    {log.sessionId ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {log.sessionId.substring(0, 16)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.sessionId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Name</label>
                  <div className="mt-1 text-sm">
                    {log.userFullName || 'Unknown User'}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Type</label>
                  <div className="mt-1">
                    {log.userType ? (
                      <Badge variant="outline">
                        {log.userType.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <div className="mt-1">
                    {log.userId ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {log.userId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.userId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resource ID</label>
                  <div className="mt-1">
                    {log.resourceId ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {log.resourceId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.resourceId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">HTTP Method & Endpoint</label>
                  <div className="flex items-center gap-2 mt-1">
                    {log.httpMethod && (
                      <Badge variant="outline" className="text-xs">
                        {log.httpMethod}
                      </Badge>
                    )}
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono flex-1">
                      {log.endpoint}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(log.endpoint)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <div className="mt-1">
                    {log.ipAddress ? (
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {log.ipAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.ipAddress!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://ipinfo.io/${log.ipAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser Information */}
          {userAgentInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Browser Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Browser</label>
                    <div className="mt-1 text-sm">{userAgentInfo.browser}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Operating System</label>
                    <div className="mt-1 text-sm">{userAgentInfo.os}</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full User Agent</label>
                  <div className="flex items-start gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 whitespace-pre-wrap break-all">
                      {userAgentInfo.full}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(userAgentInfo.full)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          {log.details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <div className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1 whitespace-pre-wrap break-words">
                    {log.details}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log.details!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
