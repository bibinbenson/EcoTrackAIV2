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
import { Loader2, Plus, Factory, Building2, Building, ArrowUpDown, BadgeAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Supplier form schema
const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  industry: z.string().optional(),
  location: z.string().optional(),
  tier: z.number().min(1).max(5).default(1),
  annualSpend: z.number().nonnegative().optional(),
  sustainabilityRating: z.number().min(0).max(100).optional()
});

export default function SuppliersPage() {
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['/api/suppliers'],
    select: (data) => data || []
  });

  // Fetch high priority risks
  const { data: highPriorityRisks = [] } = useQuery({
    queryKey: ['/api/high-priority-risks'],
    select: (data) => data || []
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: (data: z.infer<typeof supplierFormSchema>) => 
      apiRequest('/api/suppliers', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setIsAddSupplierOpen(false);
      form.reset();
    }
  });

  // Create form
  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      description: "",
      contactName: "",
      contactEmail: "",
      industry: "",
      location: "",
      tier: 1,
      annualSpend: undefined,
      sustainabilityRating: undefined
    }
  });

  const onSubmit = (data: z.infer<typeof supplierFormSchema>) => {
    createSupplierMutation.mutate(data);
  };

  // Group suppliers by tier
  const suppliersByTier = suppliers.reduce((acc: Record<number, any[]>, supplier: any) => {
    const tier = supplier.tier || 1;
    acc[tier] = acc[tier] || [];
    acc[tier].push(supplier);
    return acc;
  }, {});

  const getTierIcon = (tier: number) => {
    switch(tier) {
      case 1: return <Building2 className="h-4 w-4 text-primary" />;
      case 2: return <Building className="h-4 w-4 text-amber-500" />;
      default: return <Factory className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getIndustryBadge = (industry: string) => {
    if (!industry) return null;
    
    const colors: Record<string, string> = {
      "Manufacturing": "bg-blue-100 text-blue-800",
      "Technology": "bg-purple-100 text-purple-800",
      "Energy": "bg-yellow-100 text-yellow-800",
      "Logistics": "bg-green-100 text-green-800",
      "Agriculture": "bg-emerald-100 text-emerald-800",
      "Construction": "bg-orange-100 text-orange-800",
      "Retail": "bg-pink-100 text-pink-800",
      "Healthcare": "bg-cyan-100 text-cyan-800"
    };
    
    return (
      <Badge variant="outline" className={colors[industry] || "bg-gray-100 text-gray-800"}>
        {industry}
      </Badge>
    );
  };

  // Filter for high-risk suppliers
  const highRiskSupplierIds = new Set(highPriorityRisks.map((risk: any) => risk.supplierId));
  const highRiskSuppliers = suppliers.filter((supplier: any) => highRiskSupplierIds.has(supplier.id));

  // Calculate sustainability metrics
  const totalSuppliers = suppliers.length;
  const avgSustainabilityRating = suppliers.length > 0
    ? suppliers.reduce((sum: number, s: any) => sum + (s.sustainabilityRating || 0), 0) / totalSuppliers
    : 0;
  const highRiskPercentage = totalSuppliers > 0
    ? (highRiskSuppliers.length / totalSuppliers) * 100
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your suppliers and supply chain risks
          </p>
        </div>
        <Button onClick={() => setIsAddSupplierOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(suppliersByTier).length} tiers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sustainability Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSustainabilityRating.toFixed(1)}/100</div>
            <p className="text-xs text-muted-foreground">
              Based on supplier assessments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskSuppliers.length} ({highRiskPercentage.toFixed(1)}%)</div>
            <p className="text-xs text-muted-foreground">
              Suppliers with high priority risks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and main content */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Suppliers</TabsTrigger>
          <TabsTrigger value="tier1">Tier 1 Suppliers</TabsTrigger>
          <TabsTrigger value="tier2">Tier 2+ Suppliers</TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center">
            <BadgeAlert className="mr-1 h-4 w-4 text-destructive" />
            High Risk
            {highRiskSuppliers.length > 0 && (
              <span className="ml-1 rounded-full bg-destructive text-destructive-foreground text-xs px-2">
                {highRiskSuppliers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="p-0 pt-4">
          <SupplierTable 
            suppliers={suppliers} 
            isLoading={isLoading} 
            getTierIcon={getTierIcon}
            getIndustryBadge={getIndustryBadge}
            highRiskSupplierIds={highRiskSupplierIds}
          />
        </TabsContent>
        
        <TabsContent value="tier1" className="p-0 pt-4">
          <SupplierTable 
            suppliers={suppliers.filter((s: any) => s.tier === 1)} 
            isLoading={isLoading} 
            getTierIcon={getTierIcon}
            getIndustryBadge={getIndustryBadge}
            highRiskSupplierIds={highRiskSupplierIds}
          />
        </TabsContent>
        
        <TabsContent value="tier2" className="p-0 pt-4">
          <SupplierTable 
            suppliers={suppliers.filter((s: any) => s.tier > 1)} 
            isLoading={isLoading} 
            getTierIcon={getTierIcon}
            getIndustryBadge={getIndustryBadge}
            highRiskSupplierIds={highRiskSupplierIds}
          />
        </TabsContent>
        
        <TabsContent value="risk" className="p-0 pt-4">
          <SupplierTable 
            suppliers={highRiskSuppliers} 
            isLoading={isLoading} 
            getTierIcon={getTierIcon}
            getIndustryBadge={getIndustryBadge}
            highRiskSupplierIds={highRiskSupplierIds}
          />
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the supplier details below. You can add emission data and assessments later.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Manufacturing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@supplier.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={5} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        1 = direct supplier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="annualSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Spend ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sustainabilityRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sustainability</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          max={100} 
                          placeholder="0-100" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the supplier..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddSupplierOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSupplierMutation.isPending}
                >
                  {createSupplierMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Supplier
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Supplier Table Component
function SupplierTable({ 
  suppliers, 
  isLoading, 
  getTierIcon,
  getIndustryBadge,
  highRiskSupplierIds
}: { 
  suppliers: any[],
  isLoading: boolean,
  getTierIcon: (tier: number) => JSX.Element,
  getIndustryBadge: (industry: string) => JSX.Element | null,
  highRiskSupplierIds: Set<number>
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Tier</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Sustainability</TableHead>
              <TableHead className="text-right">Annual Spend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <span className="text-sm text-muted-foreground mt-2 block">Loading suppliers...</span>
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No suppliers found</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first supplier to get started</p>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow 
                  key={supplier.id}
                  className={highRiskSupplierIds.has(supplier.id) ? "bg-red-50" : ""}
                >
                  <TableCell>
                    <div className="flex justify-center">
                      {getTierIcon(supplier.tier || 1)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    {supplier.name}
                    {highRiskSupplierIds.has(supplier.id) && (
                      <BadgeAlert className="h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>{getIndustryBadge(supplier.industry)}</TableCell>
                  <TableCell>{supplier.location}</TableCell>
                  <TableCell>
                    {supplier.contactName && (
                      <div>
                        <p className="text-sm">{supplier.contactName}</p>
                        {supplier.contactEmail && (
                          <p className="text-xs text-muted-foreground">{supplier.contactEmail}</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {supplier.sustainabilityRating ? (
                      <div className="flex items-center justify-end">
                        <span className={`text-sm font-medium ${
                          supplier.sustainabilityRating > 70 ? "text-green-600" :
                          supplier.sustainabilityRating > 50 ? "text-amber-600" :
                          "text-red-600"
                        }`}>
                          {supplier.sustainabilityRating}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {supplier.annualSpend ? (
                      <span className="text-sm font-medium">
                        ${supplier.annualSpend.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}