import { useState, useEffect } from 'react';
import { Loader2, BarChart3, LineChart, Activity, Clock, RefreshCw, ArrowDown, ArrowUp, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  AreaChart as RechartsAreaChart,
  Area
} from 'recharts';

// API Analytics data model
type ApiMetric = {
  endpoint: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
};

// Performance metrics
type PerformanceMetric = {
  timestamp: string;
  apiResponseTime: number;
  dbQueryTime: number;
  totalResponseTime: number;
  cpuUsage: number;
  memoryUsage: number;
};

// Error metrics
type ErrorDistribution = {
  name: string;
  value: number;
  color: string;
};

// User analytics
type UserMetric = {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
};

// For demonstration purposes - API Metrics
const apiMetrics: ApiMetric[] = [
  {
    endpoint: '/api/user',
    requests: 3427,
    avgResponseTime: 82,
    errorRate: 0.2,
    p95ResponseTime: 140,
    p99ResponseTime: 210
  },
  {
    endpoint: '/api/categories',
    requests: 2981,
    avgResponseTime: 45,
    errorRate: 0.1,
    p95ResponseTime: 95,
    p99ResponseTime: 130
  },
  {
    endpoint: '/api/activities',
    requests: 4620,
    avgResponseTime: 128,
    errorRate: 0.8,
    p95ResponseTime: 245,
    p99ResponseTime: 340
  },
  {
    endpoint: '/api/carbon-footprint',
    requests: 3852,
    avgResponseTime: 156,
    errorRate: 0.5,
    p95ResponseTime: 290,
    p99ResponseTime: 420
  },
  {
    endpoint: '/api/sustainability-tips',
    requests: 2145,
    avgResponseTime: 38,
    errorRate: 0.0,
    p95ResponseTime: 75,
    p99ResponseTime: 110
  },
  {
    endpoint: '/api/achievements',
    requests: 2762,
    avgResponseTime: 110,
    errorRate: 0.3,
    p95ResponseTime: 190,
    p99ResponseTime: 260
  },
  {
    endpoint: '/api/offset-projects',
    requests: 1538,
    avgResponseTime: 142,
    errorRate: 0.4,
    p95ResponseTime: 240,
    p99ResponseTime: 350
  }
];

// Performance data for chart
const generatePerformanceData = () => {
  const now = new Date();
  const data: PerformanceMetric[] = [];
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    
    // Generate realistic-looking data with a pattern
    const hour = timestamp.getHours();
    // Higher load during business hours
    const loadFactor = (hour >= 9 && hour <= 17) ? 
      Math.random() * 0.5 + 0.5 : // 0.5-1.0 during business hours
      Math.random() * 0.3 + 0.2;  // 0.2-0.5 outside business hours
    
    const baseApiTime = 50 + Math.sin(hour / 3) * 30;
    const baseDbTime = 30 + Math.cos(hour / 4) * 15;
    
    data.push({
      timestamp: timestamp.toISOString(),
      apiResponseTime: Math.round(baseApiTime * loadFactor * (1 + Math.random() * 0.2)),
      dbQueryTime: Math.round(baseDbTime * loadFactor * (1 + Math.random() * 0.2)),
      totalResponseTime: Math.round((baseApiTime + baseDbTime) * loadFactor * (1 + Math.random() * 0.2)),
      cpuUsage: Math.round(20 + loadFactor * 50 + Math.random() * 10),
      memoryUsage: Math.round(40 + loadFactor * 30 + Math.random() * 10)
    });
  }
  
  return data;
};

// Error distribution data
const errorDistribution: ErrorDistribution[] = [
  { name: 'API Errors', value: 42, color: '#f43f5e' },
  { name: 'Database Errors', value: 28, color: '#8b5cf6' },
  { name: 'Validation Errors', value: 63, color: '#3b82f6' },
  { name: 'Authentication Errors', value: 18, color: '#10b981' },
  { name: 'Frontend Errors', value: 34, color: '#f59e0b' }
];

// User metrics
const userMetrics: UserMetric[] = [
  {
    metric: 'Active Users',
    value: 4328,
    change: 12.5,
    trend: 'up'
  },
  {
    metric: 'Average Session Time',
    value: 342, // seconds
    change: 8.3,
    trend: 'up'
  },
  {
    metric: 'Bounce Rate',
    value: 24.8, // percentage
    change: -5.2,
    trend: 'down'
  },
  {
    metric: 'Error Rate',
    value: 0.8, // percentage
    change: -12.4,
    trend: 'down'
  }
];

export default function DevAnalytics() {
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPerformanceData(generatePerformanceData());
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  // Handle timeframe change
  const handleTimeframeChange = async (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new data based on timeframe
    setPerformanceData(generatePerformanceData());
    setIsLoading(false);
    
    toast({
      title: 'Timeframe Updated',
      description: `Data updated for ${newTimeframe} timeframe`,
    });
  };
  
  // Filter API metrics based on search
  const filteredApiMetrics = apiMetrics.filter(metric => 
    metric.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format timestamp for chart display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Format number to include comma separators
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new data
    setPerformanceData(generatePerformanceData());
    setIsLoading(false);
    
    toast({
      title: 'Data Refreshed',
      description: 'Analytics data has been updated',
    });
  };

  // Render trend indicator
  const renderTrend = (trend: 'up' | 'down' | 'neutral', change: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-4 w-4 mr-1" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      );
    }
    return <span>0.0%</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Developer Analytics</h2>
          <p className="text-muted-foreground">
            Technical performance metrics and usage statistics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={timeframe}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
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
      
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading analytics data...</span>
        </div>
      )}
      
      {!isLoading && (
        <>
          {/* User Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {userMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.metric}</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {metric.metric === 'Average Session Time' 
                          ? `${Math.floor(metric.value / 60)}m ${metric.value % 60}s` 
                          : metric.metric.includes('Rate') 
                            ? `${metric.value}%` 
                            : formatNumber(metric.value)}
                      </h3>
                    </div>
                    <div>
                      {renderTrend(metric.trend, metric.change)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="api_metrics" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                API Metrics
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Error Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Response Time Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={performanceData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={formatTimestamp}
                          stroke="#94a3b8"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}ms`}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value}ms`, '']}
                          labelFormatter={(label) => formatTimestamp(label as string)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="totalResponseTime"
                          name="Total Response"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="apiResponseTime"
                          name="API Time"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="dbQueryTime"
                          name="DB Query Time"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart
                          data={performanceData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="timestamp"
                            tickFormatter={formatTimestamp}
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => [`${value}%`, 'CPU Usage']}
                            labelFormatter={(label) => formatTimestamp(label as string)}
                          />
                          <Area
                            type="monotone"
                            dataKey="cpuUsage"
                            name="CPU Usage"
                            stroke="#8b5cf6"
                            fill="#c4b5fd"
                            fillOpacity={0.6}
                          />
                        </RechartsAreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsAreaChart
                          data={performanceData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="timestamp"
                            tickFormatter={formatTimestamp}
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <RechartsTooltip 
                            formatter={(value: number) => [`${value}%`, 'Memory Usage']}
                            labelFormatter={(label) => formatTimestamp(label as string)}
                          />
                          <Area
                            type="monotone"
                            dataKey="memoryUsage"
                            name="Memory Usage"
                            stroke="#ec4899"
                            fill="#fbcfe8"
                            fillOpacity={0.6}
                          />
                        </RechartsAreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api_metrics" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search endpoints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Top API Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={filteredApiMetrics.slice(0, 5).sort((a, b) => b.requests - a.requests)}
                        margin={{ top: 10, right: 10, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="endpoint"
                          stroke="#94a3b8"
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => [formatNumber(value), 'Requests']}
                        />
                        <Bar
                          dataKey="requests"
                          name="Requests"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                      <TableHead className="text-right">Avg Time</TableHead>
                      <TableHead className="text-right">P95 Time</TableHead>
                      <TableHead className="text-right">P99 Time</TableHead>
                      <TableHead className="text-right">Error Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApiMetrics.map((api, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">
                          {api.endpoint}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(api.requests)}
                        </TableCell>
                        <TableCell className="text-right">
                          {api.avgResponseTime} ms
                        </TableCell>
                        <TableCell className="text-right">
                          {api.p95ResponseTime} ms
                        </TableCell>
                        <TableCell className="text-right">
                          {api.p99ResponseTime} ms
                        </TableCell>
                        <TableCell 
                          className={`text-right ${api.errorRate > 0.5 ? 'text-red-600' : api.errorRate > 0.2 ? 'text-amber-600' : 'text-green-600'}`}
                        >
                          {(api.errorRate * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredApiMetrics.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          No matching endpoints found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="errors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Error Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={errorDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {errorDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => [value, 'Errors']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Top Error Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {errorDistribution.sort((a, b) => b.value - a.value).map((error, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{error.name}</span>
                            <span>{error.value} errors</span>
                          </div>
                          <Progress 
                            value={(error.value / Math.max(...errorDistribution.map(e => e.value))) * 100}
                            className="h-2"
                            style={{ backgroundColor: `${error.color}30`, '--tw-progress-fill-color': error.color } as any}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Error Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={performanceData.map((data, index) => ({
                          ...data,
                          apiErrors: Math.floor(Math.random() * 5) + (index % 5 === 0 ? 8 : 1),
                          dbErrors: Math.floor(Math.random() * 3) + (index % 7 === 0 ? 5 : 0),
                          validationErrors: Math.floor(Math.random() * 4) + (index % 4 === 0 ? 6 : 2),
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={formatTimestamp}
                          stroke="#94a3b8"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          labelFormatter={(label) => formatTimestamp(label as string)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="apiErrors"
                          name="API Errors"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="dbErrors"
                          name="Database Errors"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="validationErrors"
                          name="Validation Errors"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}