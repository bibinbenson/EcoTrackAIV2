import { useState } from "react";
import { useAdminAnalytics, useActivityTracking, type ActivityFilter } from "@/hooks/use-activity-tracking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, TrendingUp, Award, Calendar, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { data: analytics, isLoading: isLoadingAnalytics, error } = useAdminAnalytics();
  
  const [filter, setFilter] = useState<ActivityFilter>({});
  const { useActivityLogs } = useActivityTracking();
  const { data: activityLogs, isLoading: isLoadingLogs } = useActivityLogs(filter);
  
  // Redirect if not logged in or not an admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user || user.accountType !== 'admin') {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform activity and user engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            asChild
          >
            <a href="/developer-portal">
              <span>Developer Portal</span>
              <Code2 className="h-4 w-4" />
            </a>
          </Button>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {format(new Date(), "MMMM d, yyyy")}
          </Badge>
        </div>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-destructive">
                  <p>Failed to load analytics data</p>
                  <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard 
                  title="Total Users"
                  value={analytics?.userSignupStats?.total || 0}
                  description="Total registered users"
                  icon={<Users className="h-4 w-4" />}
                />
                <MetricCard 
                  title="Monthly Active Users"
                  value={analytics?.activeUserStats?.currentPeriod || 0}
                  description={`${(analytics?.activeUserStats?.percentChange || 0).toFixed(1)}% from last month`}
                  trend={analytics?.activeUserStats?.percentChange > 0 ? "up" : "down"}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <MetricCard 
                  title="Carbon Reduction"
                  value={`${(analytics?.totalCarbonReduction?.total || 0).toFixed(1)} tons`}
                  description="Total carbon footprint reduced"
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MetricCard 
                  title="Top Performers"
                  value={analytics?.topUsers?.length || 0}
                  description="Users with highest reductions"
                  icon={<Award className="h-4 w-4" />}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Signups</CardTitle>
                    <CardDescription>Monthly registration trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analytics?.userSignupStats?.data || []}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#0088FE" name="Signups" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Distribution</CardTitle>
                    <CardDescription>Users by account type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics?.accountTypeDistribution || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="accountType"
                            label={({ accountType, count, percent }) => 
                              `${accountType}: ${count} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {analytics?.accountTypeDistribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Users</CardTitle>
                  <CardDescription>Users with highest carbon reductions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Carbon Reduction</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics?.topUsers?.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.totalReduction ? user.totalReduction.toFixed(2) : "0.00"} tons</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.accountType}</Badge>
                          </TableCell>
                          <TableCell>{user.createdAt ? format(new Date(user.createdAt), "PPP") : "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Logs</CardTitle>
              <CardDescription>Filter and monitor user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium block mb-2">User ID</label>
                  <Input 
                    placeholder="Filter by user ID" 
                    type="number"
                    value={filter.userId || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined;
                      setFilter(prev => ({ ...prev, userId: value }));
                    }}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium block mb-2">Action</label>
                  <Input 
                    placeholder="Filter by action" 
                    value={filter.action || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value || undefined }))}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium block mb-2">Start Date</label>
                  <DatePicker
                    date={filter.startDate}
                    onSelect={(date) => setFilter(prev => ({ ...prev, startDate: date || undefined }))}
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium block mb-2">End Date</label>
                  <DatePicker
                    date={filter.endDate}
                    onSelect={(date) => setFilter(prev => ({ ...prev, endDate: date || undefined }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="secondary"
                    onClick={() => setFilter({})}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {isLoadingLogs ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs && activityLogs.length > 0 ? (
                        activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.createdAt), "PPp")}</TableCell>
                            <TableCell>{log.userId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{log.details || "-"}</TableCell>
                            <TableCell>{log.ipAddress || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No activity logs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="carbon" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Reduction Progress</CardTitle>
              <CardDescription>Overall platform carbon reduction metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analytics?.totalCarbonReduction ? (
                <>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <StatCard 
                      title="Total Reduction" 
                      value={`${(analytics.totalCarbonReduction.total || 0).toFixed(2)} tons`} 
                      description="CO₂ equivalent"
                    />
                    <StatCard 
                      title="Monthly Change" 
                      value={`${(analytics.totalCarbonReduction.monthlyChange || 0).toFixed(2)}%`}
                      description="vs previous month"
                      trend={analytics.totalCarbonReduction.monthlyChange > 0 ? "up" : "down"}
                    />
                    <StatCard 
                      title="Per User Average" 
                      value={`${(analytics.totalCarbonReduction.perUserAverage || 0).toFixed(2)} tons`}
                      description="CO₂ equivalent per active user"
                    />
                  </div>
                  
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.totalCarbonReduction.byCategory || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoryName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalReduction" fill="#00C49F" name="Carbon Reduction (tons)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No carbon reduction data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

function MetricCard({ title, value, description, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
          </div>
          {icon && <div className="rounded-full p-2 bg-muted">{icon}</div>}
        </div>
        <p className={`mt-2 text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down';
}

function StatCard({ title, value, description, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className={`mt-1 text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
        {description}
      </div>
    </div>
  );
}