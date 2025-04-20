import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ActionRecommendationEngine from '@/components/trading/ActionRecommendationEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Mock data for carbon market trends
const marketTrendData = [
  { month: 'Jan', price: 30, volume: 2400 },
  { month: 'Feb', price: 28, volume: 2200 },
  { month: 'Mar', price: 32, volume: 2800 },
  { month: 'Apr', price: 35, volume: 3100 },
  { month: 'May', price: 38, volume: 3500 },
  { month: 'Jun', price: 40, volume: 3800 },
  { month: 'Jul', price: 42, volume: 4000 },
  { month: 'Aug', price: 45, volume: 4200 },
  { month: 'Sep', price: 48, volume: 4500 },
  { month: 'Oct', price: 50, volume: 4800 },
  { month: 'Nov', price: 52, volume: 5000 },
  { month: 'Dec', price: 54, volume: 5200 },
];

// Mock data for company performance
const companyPerformanceData = [
  { month: 'Jan', carbon: 100, industry: 120, reduction: 0 },
  { month: 'Feb', carbon: 95, industry: 118, reduction: 5 },
  { month: 'Mar', carbon: 90, industry: 115, reduction: 10 },
  { month: 'Apr', carbon: 88, industry: 117, reduction: 12 },
  { month: 'May', carbon: 84, industry: 116, reduction: 16 },
  { month: 'Jun', carbon: 80, industry: 114, reduction: 20 },
  { month: 'Jul', carbon: 78, industry: 113, reduction: 22 },
  { month: 'Aug', carbon: 75, industry: 112, reduction: 25 },
  { month: 'Sep', carbon: 72, industry: 111, reduction: 28 },
  { month: 'Oct', carbon: 70, industry: 110, reduction: 30 },
  { month: 'Nov', carbon: 68, industry: 109, reduction: 32 },
  { month: 'Dec', carbon: 65, industry: 108, reduction: 35 },
];

export default function ESGTradingPage() {
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Fetch user carbon data
  const { data: carbonData } = useQuery({
    queryKey: ['/api/carbon-by-category'],
    queryFn: async () => {
      const response = await fetch('/api/carbon-by-category');
      if (!response.ok) {
        throw new Error('Failed to fetch carbon data');
      }
      return response.json();
    },
  });
  
  // Carbon reduction opportunities value (in tons)
  const reductionOpportunities = 42;
  
  // Potential financial value (estimated)
  const potentialValue = reductionOpportunities * 45; // $45 per ton
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">ESG Trading Platform</h1>
        <p className="text-neutral-600 mt-1">
          Find opportunities to reduce your carbon footprint and trade carbon credits
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Carbon Market Price</CardTitle>
            <CardDescription>Current trading price per ton CO₂e</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-primary">$45.00</span>
              <span className="text-sm text-green-600 ml-2 mb-1">+2.3%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Reduction Opportunities</CardTitle>
            <CardDescription>Potential carbon offset to trade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-primary">{reductionOpportunities}</span>
              <span className="text-lg ml-1 mb-1">tons CO₂e</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Potential Market Value</CardTitle>
            <CardDescription>Estimated value of your reduction opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end">
              <span className="text-3xl font-bold text-primary">${potentialValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs
        defaultValue="recommendations"
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
          <TabsTrigger value="performance">Your Performance</TabsTrigger>
          <TabsTrigger value="trading">Trading Platform</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eco-Friendly Action Recommendations</CardTitle>
              <CardDescription>
                Personalized recommendations based on your carbon footprint data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActionRecommendationEngine />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="market-trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Market Trends</CardTitle>
              <CardDescription>
                Historical carbon credit pricing and trading volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={marketTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0891b2" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      name="Price ($ per ton)"
                      stroke="#0891b2"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="volume"
                      name="Trading Volume (tons)"
                      stroke="#6366f1"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Carbon prices have increased by <span className="font-semibold text-green-600">80%</span> over the past year due to stricter regulations.</p>
                    <p>Trading volume has grown by <span className="font-semibold text-green-600">116%</span>, indicating increased market participation.</p>
                    <p>Analysts project continued price growth through Q3 2025.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Market Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Expected price range: <span className="font-semibold">$50-65</span> per ton by end of year.</p>
                    <p>Key factors: EU ETS reforms, global climate commitments, and corporate net-zero targets.</p>
                    <p>Highest demand sectors: Energy, Manufacturing, and Transportation.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Carbon Performance</CardTitle>
              <CardDescription>
                Track your carbon reduction progress against industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={companyPerformanceData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="industry"
                      name="Industry Average"
                      stackId="1"
                      stroke="#6366f1"
                      fill="#818cf8"
                    />
                    <Area
                      type="monotone"
                      dataKey="carbon"
                      name="Your Carbon Footprint"
                      stackId="2"
                      stroke="#0891b2"
                      fill="#22d3ee"
                    />
                    <Area
                      type="monotone"
                      dataKey="reduction"
                      name="Your Carbon Reduction"
                      stackId="3"
                      stroke="#10b981"
                      fill="#6ee7b7"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Reduction</p>
                  <p className="text-2xl font-bold text-primary">35%</p>
                  <p className="text-xs text-muted-foreground">vs. January baseline</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Industry Ranking</p>
                  <p className="text-2xl font-bold text-primary">Top 15%</p>
                  <p className="text-xs text-muted-foreground">of your sector</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                  <p className="text-2xl font-bold text-primary">$12,450</p>
                  <p className="text-xs text-muted-foreground">estimated annual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Credit Trading</CardTitle>
              <CardDescription>
                Buy, sell or offset carbon credits based on your reduction achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="text-center mb-6">
                <p className="text-lg font-medium">Trading Platform Coming Soon</p>
                <p className="text-muted-foreground">
                  Our full carbon credit trading platform is under development
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Join the Waitlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to access our trading platform when it launches
                    </p>
                    <Button className="w-full">Join Waitlist</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule a demonstration of the upcoming trading features
                    </p>
                    <Button variant="outline" className="w-full">Request Demo</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}