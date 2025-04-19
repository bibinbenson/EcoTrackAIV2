import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { CO2ReductionForecast } from "@/components/dashboard/CO2ReductionForecast";
import { MonthlyEmissionsBreakdown } from "@/components/dashboard/MonthlyEmissionsBreakdown";
import { OffsetImpactTracker } from "@/components/dashboard/OffsetImpactTracker";
import CarbonFootprintChart from "@/components/dashboard/CarbonFootprintChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, BarChart3, AreaChart, PieChart, Leaf } from 'lucide-react';

export default function Analytics() {
  const [timePeriod, setTimePeriod] = React.useState('month');
  
  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });
  
  // Fetch top users to calculate user's percentile
  const { data: topUsers } = useQuery({
    queryKey: ["/api/users/top", 100],
    queryFn: async () => {
      const res = await fetch("/api/users/top?limit=100");
      if (!res.ok) throw new Error("Failed to fetch top users");
      return res.json();
    }
  });
  
  // Calculate user's percentile among other users
  const getUserPercentile = () => {
    if (!topUsers || !user) return null;
    
    const userCount = topUsers.length;
    if (userCount <= 1) return 100;
    
    const userIndex = topUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex === -1) return null;
    
    // Calculate percentile (higher is better)
    return Math.round(((userCount - userIndex - 1) / (userCount - 1)) * 100);
  };
  
  const userPercentile = getUserPercentile();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Carbon Analytics</h2>
          <p className="text-neutral-600">
            Detailed insights into your carbon footprint and reduction progress
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Carbon Footprint</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                  {user?.totalCarbon?.toFixed(2) || "0.00"} <span className="text-base font-normal">tons</span>
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-neutral-500" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${userPercentile && userPercentile > 50 ? 'text-green-600' : 'text-amber-600'}`}>
              {userPercentile ? `Better than ${userPercentile}% of users` : 'Calculating...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Carbon Offsets</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                  {user?.totalOffsets?.toFixed(2) || "0.00"} <span className="text-base font-normal">tons</span>
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs mt-2 text-neutral-500">
              {user?.offsetPercent?.toFixed(1) || "0"}% of your footprint offset
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Top Category</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                  {user?.topCategory || "Transport"}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs mt-2 text-neutral-500">
              {user?.topCategoryPercent?.toFixed(1) || "35"}% of your total emissions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Monthly Trend</p>
                <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                  <span className={user?.monthlyTrend < 0 ? 'text-green-600' : 'text-amber-600'}>
                    {user?.monthlyTrend < 0 ? '↓' : '↑'} {Math.abs(user?.monthlyTrend || 5)}%
                  </span>
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <AreaChart className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs mt-2 text-neutral-500">
              {user?.monthlyTrend < 0 ? 'Decrease' : 'Increase'} compared to last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="offsets">Offsets</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CarbonFootprintChart />
            <CategoryBreakdown />
          </div>
          
          <MonthlyEmissionsBreakdown />
        </TabsContent>
        
        <TabsContent value="emissions" className="space-y-6">
          <MonthlyEmissionsBreakdown />
          <CategoryBreakdown />
        </TabsContent>
        
        <TabsContent value="offsets" className="space-y-6">
          <OffsetImpactTracker />
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-6">
          <CO2ReductionForecast />
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OffsetImpactTracker />
        <CO2ReductionForecast />
      </div>
    </div>
  );
}