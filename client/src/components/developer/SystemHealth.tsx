import { useState, useEffect } from 'react';
import { Loader2, Server, Database, RefreshCw, ArrowUpCircle, Check, XCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

type SystemStatus = {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  lastChecked: string;
  components: {
    api: {
      status: 'healthy' | 'degraded' | 'critical' | 'unknown';
      responseTime: number;
      uptime: number;
    };
    database: {
      status: 'healthy' | 'degraded' | 'critical' | 'unknown';
      connectionPool: {
        total: number;
        active: number;
        idle: number;
        waitingToConnect: number;
      };
      queryAvgTime: number;
    };
    memory: {
      usage: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    storage: {
      usage: number;
      total: number;
      percentage: number;
    };
  };
  recentErrors: {
    count: number;
    criticalCount: number;
    timeframe: string;
  };
};

// Function to generate health status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'degraded':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Function to get status icon
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'healthy':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'degraded':
      return <ArrowUpCircle className="h-4 w-4 text-amber-600" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <RefreshCw className="h-4 w-4 text-gray-600" />;
  }
};

export default function SystemHealth() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to fetch system health
  const fetchSystemHealth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would have a dedicated API endpoint for this
      // const res = await apiRequest('GET', '/api/developer/system-health');
      // const data = await res.json();
      
      // For now, simulate a response
      // This function generates realistic-looking but randomized system health data
      const generateMockHealth = (): SystemStatus => {
        // Determine overall status based on component status
        const generateStatus = (): 'healthy' | 'degraded' | 'critical' | 'unknown' => {
          const rand = Math.random();
          if (rand > 0.9) return 'critical';
          if (rand > 0.7) return 'degraded';
          return 'healthy';
        };
        
        const apiStatus = generateStatus();
        const dbStatus = generateStatus();
        const overallStatus = apiStatus === 'critical' || dbStatus === 'critical' 
          ? 'critical' 
          : apiStatus === 'degraded' || dbStatus === 'degraded'
            ? 'degraded'
            : 'healthy';
            
        const memoryPercentage = Math.floor(Math.random() * 35) + 55; // 55-90%
        const storagePercentage = Math.floor(Math.random() * 50) + 30; // 30-80%
        
        return {
          status: overallStatus,
          lastChecked: new Date().toISOString(),
          components: {
            api: {
              status: apiStatus,
              responseTime: Math.floor(Math.random() * 200) + 20, // 20-220ms
              uptime: Math.floor(Math.random() * 20) + 80, // 80-100%
            },
            database: {
              status: dbStatus,
              connectionPool: {
                total: 100,
                active: Math.floor(Math.random() * 40) + 10, // 10-50
                idle: Math.floor(Math.random() * 30) + 40, // 40-70
                waitingToConnect: Math.floor(Math.random() * 5), // 0-5
              },
              queryAvgTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
            },
            memory: {
              usage: Math.floor((memoryPercentage / 100) * 8192), // 8GB total
              total: 8192, // 8GB
              percentage: memoryPercentage,
            },
            cpu: {
              usage: Math.floor(Math.random() * 60) + 10, // 10-70%
            },
            storage: {
              usage: Math.floor((storagePercentage / 100) * 1024 * 50), // 50GB total
              total: 1024 * 50, // 50GB
              percentage: storagePercentage,
            },
          },
          recentErrors: {
            count: Math.floor(Math.random() * 10),
            criticalCount: Math.floor(Math.random() * 3),
            timeframe: '24h',
          },
        };
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockHealth();
      setSystemStatus(mockData);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to fetch system health:', err);
      setError(err.message || 'Failed to fetch system health data');
      
      toast({
        title: 'Error Fetching System Health',
        description: err.message || 'There was a problem fetching the system health data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchSystemHealth();
    
    // Set up auto-refresh if enabled
    let intervalId: number | null = null;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        fetchSystemHealth();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading && !systemStatus) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading system health data...</span>
      </div>
    );
  }

  if (error && !systemStatus) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 mb-4">
        <h3 className="font-bold flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          Error Loading System Health
        </h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => fetchSystemHealth()}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {systemStatus && (
            <Badge 
              variant="outline" 
              className={getStatusVariant(systemStatus.status)}
            >
              <StatusIcon status={systemStatus.status} />
              <span className="ml-1 capitalize">{systemStatus.status}</span>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-primary/10' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSystemHealth()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* API Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Server className="h-4 w-4 mr-2 text-primary" />
                API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusVariant(systemStatus.components.api.status)}
                  >
                    <StatusIcon status={systemStatus.components.api.status} />
                    <span className="ml-1 capitalize">{systemStatus.components.api.status}</span>
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-mono">{systemStatus.components.api.responseTime} ms</span>
                  </div>
                  <Progress 
                    value={
                      systemStatus.components.api.responseTime > 200 
                        ? 100 
                        : (systemStatus.components.api.responseTime / 200) * 100
                    }
                    className={
                      systemStatus.components.api.responseTime > 150 
                        ? 'bg-red-200' 
                        : systemStatus.components.api.responseTime > 100 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>{systemStatus.components.api.uptime}%</span>
                  </div>
                  <Progress 
                    value={systemStatus.components.api.uptime}
                    className={
                      systemStatus.components.api.uptime < 95 
                        ? 'bg-red-200' 
                        : systemStatus.components.api.uptime < 99 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Database className="h-4 w-4 mr-2 text-primary" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status</span>
                  <Badge 
                    variant="outline" 
                    className={getStatusVariant(systemStatus.components.database.status)}
                  >
                    <StatusIcon status={systemStatus.components.database.status} />
                    <span className="ml-1 capitalize">{systemStatus.components.database.status}</span>
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Query Time (avg)</span>
                    <span className="font-mono">{systemStatus.components.database.queryAvgTime} ms</span>
                  </div>
                  <Progress 
                    value={
                      systemStatus.components.database.queryAvgTime > 100 
                        ? 100 
                        : (systemStatus.components.database.queryAvgTime / 100) * 100
                    }
                    className={
                      systemStatus.components.database.queryAvgTime > 75 
                        ? 'bg-red-200' 
                        : systemStatus.components.database.queryAvgTime > 50 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Connection Pool</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded p-2 text-center">
                      <div className="text-muted-foreground text-xs">Active</div>
                      <div className="font-semibold">
                        {systemStatus.components.database.connectionPool.active} / {systemStatus.components.database.connectionPool.total}
                      </div>
                    </div>
                    <div className="border rounded p-2 text-center">
                      <div className="text-muted-foreground text-xs">Idle</div>
                      <div className="font-semibold">
                        {systemStatus.components.database.connectionPool.idle}
                      </div>
                    </div>
                    <div className="border rounded p-2 text-center col-span-2">
                      <div className="text-muted-foreground text-xs">Waiting</div>
                      <div className="font-semibold">
                        {systemStatus.components.database.connectionPool.waitingToConnect}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                System Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>{systemStatus.components.cpu.usage}%</span>
                  </div>
                  <Progress 
                    value={systemStatus.components.cpu.usage}
                    className={
                      systemStatus.components.cpu.usage > 80 
                        ? 'bg-red-200' 
                        : systemStatus.components.cpu.usage > 60 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {systemStatus.components.memory.percentage}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">
                            {formatBytes(systemStatus.components.memory.usage)} / {formatBytes(systemStatus.components.memory.total * 1024 * 1024)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Progress 
                    value={systemStatus.components.memory.percentage}
                    className={
                      systemStatus.components.memory.percentage > 85 
                        ? 'bg-red-200' 
                        : systemStatus.components.memory.percentage > 70 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {systemStatus.components.storage.percentage}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono text-xs">
                            {formatBytes(systemStatus.components.storage.usage)} / {formatBytes(systemStatus.components.storage.total * 1024 * 1024)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Progress 
                    value={systemStatus.components.storage.percentage}
                    className={
                      systemStatus.components.storage.percentage > 85 
                        ? 'bg-red-200' 
                        : systemStatus.components.storage.percentage > 70 
                          ? 'bg-amber-200' 
                          : 'bg-green-200'
                    }
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-xs text-muted-foreground">Critical</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                    <span className="text-xs text-muted-foreground">Warning</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-xs text-muted-foreground">Normal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Errors */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                Recent Error Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-center sm:text-left">
                  <div className="text-2xl font-bold">
                    {systemStatus.recentErrors.count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Errors in last {systemStatus.recentErrors.timeframe}
                  </div>
                </div>
                
                <div className="text-center border-l border-r px-4">
                  <div className="text-2xl font-bold text-destructive">
                    {systemStatus.recentErrors.criticalCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Critical errors
                  </div>
                </div>
                
                <div className="text-right flex-grow">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      /* In a real implementation, this would navigate to the error logs tab */
                      toast({
                        title: 'Viewing Error Logs',
                        description: 'View all errors in the Error Logs tab',
                      });
                    }}
                  >
                    View Full Error Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}