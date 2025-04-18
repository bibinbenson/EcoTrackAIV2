import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Factory, ArrowUpDown, Info, Dices } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Emission form schema
const emissionFormSchema = z.object({
  supplierId: z.number().min(1, "Supplier is required"),
  year: z.number().min(2000).max(2100),
  quarter: z.number().min(1).max(4),
  scope1Emissions: z.number().nonnegative().optional(),
  scope2Emissions: z.number().nonnegative().optional(),
  scope3Emissions: z.number().nonnegative().optional(),
  dataSource: z.string().optional(),
  verificationStatus: z.string().optional(),
  notes: z.string().optional()
});

export default function SupplierEmissionsPage() {
  const [isAddEmissionOpen, setIsAddEmissionOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTab, setSelectedTab] = useState("dashboard");

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    select: (data) => data || []
  });

  // Fetch emissions by year
  const { data: emissionsByYear = [], isLoading } = useQuery({
    queryKey: ['/api/emissions-by-year', selectedYear],
    select: (data) => data || []
  });

  // Fetch total emissions
  const { data: totalEmissions = { total: 0 } } = useQuery({
    queryKey: ['/api/supply-chain/total-emissions'],
    select: (data) => data || { total: 0 }
  });

  // Create emission mutation
  const createEmissionMutation = useMutation({
    mutationFn: (data: z.infer<typeof emissionFormSchema>) => 
      apiRequest('/api/supplier-emissions', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emissions-by-year'] });
      queryClient.invalidateQueries({ queryKey: ['/api/supply-chain/total-emissions'] });
      setIsAddEmissionOpen(false);
      form.reset();
    }
  });

  // Create form
  const form = useForm<z.infer<typeof emissionFormSchema>>({
    resolver: zodResolver(emissionFormSchema),
    defaultValues: {
      supplierId: undefined,
      year: new Date().getFullYear(),
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      scope1Emissions: undefined,
      scope2Emissions: undefined,
      scope3Emissions: undefined,
      dataSource: "reported",
      verificationStatus: "unverified",
      notes: ""
    }
  });

  const onSubmit = (data: z.infer<typeof emissionFormSchema>) => {
    createEmissionMutation.mutate(data);
  };

  // Prepare chart data
  const chartData = emissionsByYear.map((item: any) => ({
    name: item.supplier?.name || `Supplier ${item.supplierId}`,
    scope1: item.totalScope1 || 0,
    scope2: item.totalScope2 || 0,
    scope3: item.totalScope3 || 0,
    total: (item.totalScope1 || 0) + (item.totalScope2 || 0) + (item.totalScope3 || 0)
  }));

  // Calculate scope totals
  const scope1Total = chartData.reduce((sum, item) => sum + item.scope1, 0);
  const scope2Total = chartData.reduce((sum, item) => sum + item.scope2, 0);
  const scope3Total = chartData.reduce((sum, item) => sum + item.scope3, 0);
  const grandTotal = scope1Total + scope2Total + scope3Total;

  // Prepare scope breakdown data for pie chart
  const scopeBreakdown = [
    { name: 'Scope 1', value: scope1Total },
    { name: 'Scope 2', value: scope2Total },
    { name: 'Scope 3', value: scope3Total }
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  const SCOPE_COLORS = {
    scope1: '#3B82F6', // blue
    scope2: '#10B981', // green
    scope3: '#F59E0B', // amber
  };

  const verificationStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "third-party-verified": "bg-green-100 text-green-800",
      "self-verified": "bg-blue-100 text-blue-800",
      "unverified": "bg-amber-100 text-amber-800",
      "pending": "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge variant="outline" className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain Emissions</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze your suppliers' carbon emissions
          </p>
        </div>
        <Button onClick={() => setIsAddEmissionOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Emission Data
        </Button>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grandTotal.toFixed(1)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">
              Reported for {selectedYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scope 1 Emissions</CardTitle>
            <CardDescription className="text-xs">Direct emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scope1Total.toFixed(1)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">
              {grandTotal > 0 ? ((scope1Total / grandTotal) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scope 2 Emissions</CardTitle>
            <CardDescription className="text-xs">Energy indirect</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scope2Total.toFixed(1)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">
              {grandTotal > 0 ? ((scope2Total / grandTotal) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scope 3 Emissions</CardTitle>
            <CardDescription className="text-xs">Other indirect</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scope3Total.toFixed(1)} tCO₂e</div>
            <p className="text-xs text-muted-foreground">
              {grandTotal > 0 ? ((scope3Total / grandTotal) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year selector */}
      <div className="flex items-center justify-between">
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Tabs defaultValue="dashboard" value={selectedTab} onValueChange={setSelectedTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data">Emission Data</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <TabsContent value="dashboard" className="p-0 pt-4 space-y-6">
        {chartData.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center">
            <Info className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No Emission Data</h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
              There is no emission data for suppliers in {selectedYear}. Add emissions data to see visualizations.
            </p>
            <Button onClick={() => setIsAddEmissionOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Emission Data
            </Button>
          </Card>
        ) : (
          <>
            {/* Supplier Emissions chart */}
            <Card>
              <CardHeader>
                <CardTitle>Emissions by Supplier</CardTitle>
                <CardDescription>
                  Breakdown of scope 1, 2, and 3 emissions per supplier for {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} tCO₂e`, '']} />
                    <Legend />
                    <Bar dataKey="scope1" name="Scope 1" fill={SCOPE_COLORS.scope1} />
                    <Bar dataKey="scope2" name="Scope 2" fill={SCOPE_COLORS.scope2} />
                    <Bar dataKey="scope3" name="Scope 3" fill={SCOPE_COLORS.scope3} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scope Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scope Breakdown</CardTitle>
                  <CardDescription>
                    Distribution of emissions across the three scopes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-full max-w-xs">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        data={[
                          { name: "Distribution", scope1: scope1Total, scope2: scope2Total, scope3: scope3Total }
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="scope3" 
                          name="Scope 3"
                          stackId="1" 
                          stroke={SCOPE_COLORS.scope3} 
                          fill={SCOPE_COLORS.scope3} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="scope2" 
                          name="Scope 2"
                          stackId="1" 
                          stroke={SCOPE_COLORS.scope2} 
                          fill={SCOPE_COLORS.scope2} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="scope1" 
                          name="Scope 1"
                          stackId="1" 
                          stroke={SCOPE_COLORS.scope1} 
                          fill={SCOPE_COLORS.scope1} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Emitters</CardTitle>
                  <CardDescription>
                    Suppliers with the highest total emissions in {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Emissions (tCO₂e)</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartData
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5)
                        .map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.total.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                              {grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(1) : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="data" className="p-0 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Emissions Data ({selectedYear})</CardTitle>
            <CardDescription>
              Detailed emissions data for all suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Scope 1 (tCO₂e)</TableHead>
                  <TableHead className="text-right">Scope 2 (tCO₂e)</TableHead>
                  <TableHead className="text-right">Scope 3 (tCO₂e)</TableHead>
                  <TableHead className="text-right">Total (tCO₂e)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="text-sm text-muted-foreground mt-2 block">Loading emissions data...</span>
                    </TableCell>
                  </TableRow>
                ) : emissionsByYear.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No emissions data found for {selectedYear}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add emissions data to track your supply chain carbon footprint
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  chartData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.scope1.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{item.scope2.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{item.scope3.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-semibold">{item.total.toFixed(1)}</TableCell>
                    </TableRow>
                  ))
                )}
                {chartData.length > 0 && (
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-semibold">{scope1Total.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-semibold">{scope2Total.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-semibold">{scope3Total.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-bold">{grandTotal.toFixed(1)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add Emission Dialog */}
      <Dialog open={isAddEmissionOpen} onOpenChange={setIsAddEmissionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Emission Data</DialogTitle>
            <DialogDescription>
              Enter emission data for a supplier. All emission values should be in metric tons of CO₂ equivalent (tCO₂e).
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={2000} 
                          max={2100} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quarter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarter</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                          <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                          <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                          <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="scope1Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 1 (tCO₂e)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          step={0.1} 
                          placeholder="0.0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Direct emissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scope2Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 2 (tCO₂e)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          step={0.1} 
                          placeholder="0.0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Energy indirect
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scope3Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 3 (tCO₂e)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          step={0.1} 
                          placeholder="0.0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Other indirect
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Source</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reported">Reported by Supplier</SelectItem>
                          <SelectItem value="estimated">Estimated</SelectItem>
                          <SelectItem value="calculated">Calculated</SelectItem>
                          <SelectItem value="industry-average">Industry Average</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="verificationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select verification status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unverified">Unverified</SelectItem>
                          <SelectItem value="self-verified">Self-verified</SelectItem>
                          <SelectItem value="third-party-verified">Third-party Verified</SelectItem>
                          <SelectItem value="pending">Verification Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Any additional information..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddEmissionOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEmissionMutation.isPending}
                >
                  {createEmissionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Emission Data
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}