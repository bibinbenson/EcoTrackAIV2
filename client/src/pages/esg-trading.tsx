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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EsgCompany, EsgSecurity, EsgPortfolio, EsgTransaction } from "@shared/schema";

// For fallback when API data isn't available yet
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

// Fallback performance data
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
  const { toast } = useToast();
  
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
  
  // Fetch ESG Companies
  const { data: esgCompanies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['/api/esg/companies'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/esg/companies');
        if (!response.ok) {
          return []; // Return empty array for now until API is fully implemented
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching ESG companies:", error);
        return []; // Return empty array for now
      }
    },
  });
  
  // Fetch ESG Securities
  const { data: esgSecurities, isLoading: isLoadingSecurities } = useQuery({
    queryKey: ['/api/esg/securities'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/esg/securities');
        if (!response.ok) {
          return []; // Return empty array for now until API is fully implemented
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching ESG securities:", error);
        return []; // Return empty array for now
      }
    },
  });
  
  // Fetch user's ESG portfolios
  const { data: userPortfolios, isLoading: isLoadingPortfolios } = useQuery({
    queryKey: ['/api/esg/portfolios/user/1'], // Hardcoded user ID for now
    queryFn: async () => {
      try {
        const response = await fetch('/api/esg/portfolios/user/1');
        if (!response.ok) {
          return []; // Return empty array for now until API is fully implemented
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching user portfolios:", error);
        return []; // Return empty array for now
      }
    },
  });
  
  // Carbon reduction opportunities value (in tons)
  const reductionOpportunities = 42;
  
  // Potential financial value (estimated)
  const potentialValue = reductionOpportunities * 45; // $45 per ton
  
  // Join the waitlist function
  const handleJoinWaitlist = async () => {
    try {
      await apiRequest("POST", "/api/esg/waitlist", { email: "user@example.com" }); // In a real app, we'd collect email
      toast({
        title: "Success!",
        description: "You have been added to the waitlist. We'll notify you when the full trading platform is available.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the waitlist. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
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
            <CardContent>
              <Tabs defaultValue="market">
                <TabsList className="mb-4">
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="portfolio">Your Portfolio</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="market" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">ESG Securities</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          Sort
                        </Button>
                      </div>
                    </div>
                    
                    {isLoadingSecurities ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : esgSecurities && esgSecurities.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>24h Change</TableHead>
                              <TableHead>ESG Score</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* Show real securities data once available */}
                            <TableRow>
                              <TableCell className="font-medium">MSFT</TableCell>
                              <TableCell>Microsoft Corp</TableCell>
                              <TableCell>$337.45</TableCell>
                              <TableCell className="text-green-600">+1.2%</TableCell>
                              <TableCell>A-</TableCell>
                              <TableCell><Button size="sm">Trade</Button></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">AAPL</TableCell>
                              <TableCell>Apple Inc</TableCell>
                              <TableCell>$165.33</TableCell>
                              <TableCell className="text-red-600">-0.8%</TableCell>
                              <TableCell>B+</TableCell>
                              <TableCell><Button size="sm">Trade</Button></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">TSLA</TableCell>
                              <TableCell>Tesla Inc</TableCell>
                              <TableCell>$169.48</TableCell>
                              <TableCell className="text-green-600">+2.3%</TableCell>
                              <TableCell>A</TableCell>
                              <TableCell><Button size="sm">Trade</Button></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No securities available at the moment</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-8">
                      <h3 className="text-lg font-semibold">ESG Companies</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </div>
                    </div>
                    
                    {isLoadingCompanies ? (
                      <div className="py-8 flex justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : esgCompanies && esgCompanies.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sample company cards - will be populated with real data */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Microsoft</CardTitle>
                            <CardDescription>Technology</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ESG Rating:</span>
                                <span className="font-medium">A-</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Carbon Intensity:</span>
                                <span className="font-medium">Low</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Net Zero Target:</span>
                                <span className="font-medium">2030</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Tesla</CardTitle>
                            <CardDescription>Automotive</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ESG Rating:</span>
                                <span className="font-medium">A</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Carbon Intensity:</span>
                                <span className="font-medium">Very Low</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Net Zero Target:</span>
                                <span className="font-medium">2025</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">ExxonMobil</CardTitle>
                            <CardDescription>Energy</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ESG Rating:</span>
                                <span className="font-medium">C</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Carbon Intensity:</span>
                                <span className="font-medium">Very High</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Net Zero Target:</span>
                                <span className="font-medium">2050</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">No companies available at the moment</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="portfolio" className="space-y-6">
                  {isLoadingPortfolios ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : userPortfolios && userPortfolios.length > 0 ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sustainable Growth Portfolio</CardTitle>
                          <CardDescription>Created on April 15, 2025</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between pb-4 border-b">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">$24,680.45</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Return</p>
                                <p className="text-xl font-semibold text-green-600">+12.4%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                                <p className="text-xl font-semibold text-blue-600">-28% vs. Index</p>
                              </div>
                            </div>
                            
                            <h4 className="font-medium">Holdings</h4>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Security</TableHead>
                                    <TableHead>Shares</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>ESG Rating</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">MSFT</TableCell>
                                    <TableCell>15</TableCell>
                                    <TableCell>$337.45</TableCell>
                                    <TableCell>$5,061.75</TableCell>
                                    <TableCell>A-</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">AAPL</TableCell>
                                    <TableCell>25</TableCell>
                                    <TableCell>$165.33</TableCell>
                                    <TableCell>$4,133.25</TableCell>
                                    <TableCell>B+</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">TSLA</TableCell>
                                    <TableCell>20</TableCell>
                                    <TableCell>$169.48</TableCell>
                                    <TableCell>$3,389.60</TableCell>
                                    <TableCell>A</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Rebalance</Button>
                              <Button>Add Holdings</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center bg-muted/30 rounded-lg">
                      <h3 className="text-xl font-medium mb-2">Create Your First Portfolio</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        Start your sustainable investing journey by creating an ESG-focused portfolio
                      </p>
                      <Button size="lg">Create Portfolio</Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Recent Transactions</h3>
                    <Button variant="outline" size="sm">
                      Export History
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Security</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Apr 18, 2025</TableCell>
                          <TableCell>Buy</TableCell>
                          <TableCell>MSFT</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>$334.21</TableCell>
                          <TableCell>$1,671.05</TableCell>
                          <TableCell>Completed</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Apr 15, 2025</TableCell>
                          <TableCell>Buy</TableCell>
                          <TableCell>AAPL</TableCell>
                          <TableCell>10</TableCell>
                          <TableCell>$164.90</TableCell>
                          <TableCell>$1,649.00</TableCell>
                          <TableCell>Completed</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Apr 15, 2025</TableCell>
                          <TableCell>Buy</TableCell>
                          <TableCell>TSLA</TableCell>
                          <TableCell>8</TableCell>
                          <TableCell>$166.75</TableCell>
                          <TableCell>$1,334.00</TableCell>
                          <TableCell>Completed</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="border-t mt-8 pt-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-medium mb-2">Advanced Trading Platform Beta</h3>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Our full carbon credit trading platform with advanced analytics and automated ESG screening is available for beta testing.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Join the Waitlist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Be the first to access our advanced trading features when they launch
                      </p>
                      <Button className="w-full" onClick={handleJoinWaitlist}>Join Waitlist</Button>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}