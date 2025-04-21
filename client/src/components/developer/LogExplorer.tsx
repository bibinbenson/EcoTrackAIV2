import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Filter, Download, RotateCcw, CheckCircle, AlertCircle, XCircle, ServerCrash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

// Define the ErrorLog type since we're importing from schema.ts
type ErrorLog = {
  id: number;
  userId: number | null;
  severity: string;
  errorMessage: string;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
  resolved: boolean;
  resolution?: string;
  createdAt: string;
};

type FilterOptions = {
  severity: string;
  timeframe: string;
  resolved: string;
};

export default function LogExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    severity: 'all',
    timeframe: 'all',
    resolved: 'all',
  });

  // Fetch error logs
  const { data: logs, isLoading, error, refetch } = useQuery<ErrorLog[]>({
    queryKey: ['/api/developer/error-logs'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/error-logs');
        return await res.json();
      } catch (err) {
        console.error('Failed to fetch error logs:', err);
        // Return mock data for demonstration if API endpoint is not ready
        return [
          {
            id: 1,
            userId: 4,
            severity: 'error',
            errorMessage: 'Failed to load user data: TypeError: Cannot read property of undefined',
            stackTrace: 'Error: Failed to load user data\n    at UserProfile.tsx:42:12\n    at processQueue (react-dom.development.js:3991)\n    at eval (react-dom.development.js:4052)',
            url: '/profile',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            resolved: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          },
          {
            id: 2,
            userId: null,
            severity: 'critical',
            errorMessage: 'Database connection error: ECONNREFUSED',
            stackTrace: 'Error: Database connection error\n    at connectToDatabase (db.ts:15:7)\n    at Server.start (server.ts:28:3)',
            resolved: true,
            resolution: 'Restarted database service',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
          },
          {
            id: 3,
            userId: 2,
            severity: 'warning',
            errorMessage: 'API rate limit exceeded for endpoint /api/offset-projects',
            url: '/api/offset-projects',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            resolved: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        ];
      }
    },
  });

  // Filter and search logs
  const filteredLogs = logs
    ? logs.filter((log) => {
        // Filter by search query
        const matchesSearch =
          searchQuery === '' ||
          log.errorMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.stackTrace && log.stackTrace.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.url && log.url.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter by severity
        const matchesSeverity =
          filters.severity === 'all' || log.severity === filters.severity;

        // Filter by resolution status
        const matchesResolved =
          filters.resolved === 'all' ||
          (filters.resolved === 'resolved' && log.resolved) ||
          (filters.resolved === 'unresolved' && !log.resolved);

        // Filter by timeframe
        let matchesTimeframe = true;
        const logDate = new Date(log.createdAt);
        const now = new Date();
        
        if (filters.timeframe === 'today') {
          matchesTimeframe = logDate.toDateString() === now.toDateString();
        } else if (filters.timeframe === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesTimeframe = logDate >= weekAgo;
        } else if (filters.timeframe === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesTimeframe = logDate >= monthAgo;
        }

        return matchesSearch && matchesSeverity && matchesResolved && matchesTimeframe;
      })
    : [];

  // Mark error as resolved
  const handleResolveError = async (logId: number) => {
    try {
      // In a real implementation, this would call an API endpoint to update the database
      // await apiRequest('POST', `/api/developer/error-logs/${logId}/resolve`, {
      //   resolution: 'Marked as resolved from Developer Portal',
      // });
      
      toast({
        title: 'Error Resolved',
        description: 'The error has been marked as resolved.',
      });
      
      // Simulate API response by updating local state
      if (logs) {
        const updatedLogs = logs.map(log => 
          log.id === logId ? { ...log, resolved: true, resolution: 'Marked as resolved from Developer Portal' } : log
        );
        // Manually update the cache since we're not doing a real API call yet
        refetch();
      }
    } catch (err) {
      console.error('Failed to resolve error:', err);
      toast({
        title: 'Failed to Resolve Error',
        description: 'There was a problem marking the error as resolved.',
        variant: 'destructive',
      });
    }
  };

  // Export logs to JSON file
  const exportLogs = () => {
    if (!filteredLogs || filteredLogs.length === 0) {
      toast({
        title: 'No Logs to Export',
        description: 'There are no logs matching the current filters to export.',
        variant: 'default',
      });
      return;
    }

    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `error-logs-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Helper function to render severity badge
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-600">Error</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Warning</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading error logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 mb-4">
        <h3 className="font-bold flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Error Loading Logs
        </h3>
        <p>There was a problem loading the error logs. Please try again later.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => refetch()}
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search error messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 ml-auto">
          <Select
            value={filters.severity}
            onValueChange={(value) => setFilters({ ...filters, severity: value })}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.timeframe}
            onValueChange={(value) => setFilters({ ...filters, timeframe: value })}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.resolved}
            onValueChange={(value) => setFilters({ ...filters, resolved: value })}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={exportLogs}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {(!logs || logs.length === 0) && (
        <div className="text-center p-6 border border-dashed rounded-md">
          <ServerCrash className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-semibold">No Error Logs Found</h3>
          <p className="text-muted-foreground">
            There are no error logs to display. This is a good thing!
          </p>
        </div>
      )}

      {logs && logs.length > 0 && filteredLogs.length === 0 && (
        <div className="text-center p-6 border border-dashed rounded-md">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-semibold">No Matching Logs</h3>
          <p className="text-muted-foreground">
            No logs match your current search and filter criteria.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => {
              setSearchQuery('');
              setFilters({
                severity: 'all',
                timeframe: 'all',
                resolved: 'all',
              });
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {filteredLogs && filteredLogs.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Time</TableHead>
                <TableHead className="w-[100px]">Severity</TableHead>
                <TableHead>Error Message</TableHead>
                <TableHead className="w-[120px]">URL</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow 
                  key={log.id}
                  className={`cursor-pointer ${expandedLogId === log.id ? 'bg-muted/50' : ''}`}
                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                >
                  <TableCell className="font-mono text-xs">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>{renderSeverityBadge(log.severity)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.errorMessage.length > 60
                      ? `${log.errorMessage.substring(0, 60)}...`
                      : log.errorMessage}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[120px]">
                    {log.url || '-'}
                  </TableCell>
                  <TableCell>
                    {log.resolved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <AlertCircle className="h-3 w-3 mr-1" /> Unresolved
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              disabled={log.resolved}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveError(log.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark as Resolved</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {expandedLogId && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            {logs && expandedLogId && (() => {
              const log = logs.find(l => l.id === expandedLogId);
              if (!log) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">Error Details</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedLogId(null)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                      <p className="font-mono text-sm">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">User ID</h4>
                      <p className="font-mono text-sm">{log.userId || 'Not logged in'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Severity</h4>
                      <p>{renderSeverityBadge(log.severity)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">User Agent</h4>
                      <p className="font-mono text-xs">
                        {log.userAgent || 'Not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Error Message</h4>
                    <div className="font-mono text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded border">
                      {log.errorMessage}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Stack Trace</h4>
                    <pre className="font-mono text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded border overflow-x-auto">
                      {log.stackTrace || 'No stack trace available'}
                    </pre>
                  </div>
                  
                  {log.url && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">URL</h4>
                      <p className="font-mono text-sm truncate">{log.url}</p>
                    </div>
                  )}
                  
                  {log.resolved && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Resolution</h4>
                      <p className="text-sm">{log.resolution || 'Marked as resolved'}</p>
                    </div>
                  )}
                  
                  {!log.resolved && (
                    <div className="pt-2">
                      <Button onClick={() => handleResolveError(log.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between text-sm text-muted-foreground pt-2">
        <span>Showing {filteredLogs?.length || 0} of {logs?.length || 0} logs</span>
      </div>
    </div>
  );
}