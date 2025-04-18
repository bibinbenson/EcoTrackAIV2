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
import { Loader2, Plus, BadgeAlert, Clock, Calendar, CalendarDays, Shield, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Risk form schema
const riskFormSchema = z.object({
  supplierId: z.number().min(1, "Supplier is required"),
  riskType: z.string().min(1, "Risk type is required"),
  riskLevel: z.string().min(1, "Risk level is required"),
  description: z.string().min(1, "Description is required"),
  potentialImpact: z.string().optional(),
  mitigationPlan: z.string().optional(),
  status: z.string().default("identified"),
  responsibleUserId: z.number().optional(),
  dueDate: z.string().optional().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Due date must be in the format YYYY-MM-DD",
  })
});

export default function SupplyChainRisksPage() {
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // Fetch suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['/api/suppliers'],
    select: (data) => data || []
  });

  // Fetch high priority risks
  const { data: highPriorityRisks = [], isLoading: isHighRiskLoading } = useQuery({
    queryKey: ['/api/high-priority-risks'],
    select: (data) => data || []
  });

  // Create risk mutation
  const createRiskMutation = useMutation({
    mutationFn: (data: z.infer<typeof riskFormSchema>) => 
      apiRequest('/api/supply-chain-risks', { method: 'POST', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/high-priority-risks'] });
      setIsAddRiskOpen(false);
      form.reset();
    }
  });

  // Create form
  const form = useForm<z.infer<typeof riskFormSchema>>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      supplierId: undefined,
      riskType: "climate", 
      riskLevel: "medium",
      description: "",
      potentialImpact: "",
      mitigationPlan: "",
      status: "identified",
      responsibleUserId: 1, // Default to current user
      dueDate: undefined
    }
  });

  const onSubmit = (data: z.infer<typeof riskFormSchema>) => {
    createRiskMutation.mutate(data);
  };

  const getRiskLevelBadge = (level: string) => {
    const levelColors: Record<string, string> = {
      "low": "bg-blue-100 text-blue-800",
      "medium": "bg-amber-100 text-amber-800",
      "high": "bg-red-100 text-red-800",
      "critical": "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge variant="outline" className={levelColors[level] || "bg-gray-100 text-gray-800"}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getRiskTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      "climate": "bg-green-100 text-green-800",
      "regulatory": "bg-blue-100 text-blue-800",
      "social": "bg-orange-100 text-orange-800",
      "economic": "bg-yellow-100 text-yellow-800",
      "operational": "bg-purple-100 text-purple-800",
      "compliance": "bg-cyan-100 text-cyan-800",
      "geopolitical": "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="outline" className={typeColors[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "identified": "bg-blue-100 text-blue-800",
      "monitored": "bg-amber-100 text-amber-800",
      "mitigated": "bg-green-100 text-green-800",
      "resolved": "bg-emerald-100 text-emerald-800"
    };
    
    return (
      <Badge variant="outline" className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  // Calculate due soon risks (due in next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const dueSoonRisks = highPriorityRisks.filter((risk: any) => {
    if (!risk.dueDate) return false;
    const dueDate = new Date(risk.dueDate);
    return dueDate > today && dueDate <= thirtyDaysFromNow;
  });

  // Count risks by level
  const risksByLevel = highPriorityRisks.reduce((acc: Record<string, number>, risk: any) => {
    const level = risk.riskLevel || "unknown";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  // Count risks by type
  const risksByType = highPriorityRisks.reduce((acc: Record<string, number>, risk: any) => {
    const type = risk.riskType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Group risks by supplier
  const supplierRiskCounts = highPriorityRisks.reduce((acc: Record<number, number>, risk: any) => {
    const supplierId = risk.supplierId;
    acc[supplierId] = (acc[supplierId] || 0) + 1;
    return acc;
  }, {});

  // Find suppliers with most risks
  const suppliersWithMostRisks = suppliers
    .map((supplier: any) => ({
      ...supplier,
      riskCount: supplierRiskCounts[supplier.id] || 0
    }))
    .sort((a: any, b: any) => b.riskCount - a.riskCount)
    .slice(0, 5);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supply Chain Risks</h1>
          <p className="text-muted-foreground mt-1">
            Identify, monitor, and mitigate supply chain risks
          </p>
        </div>
        <Button onClick={() => setIsAddRiskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Metrics cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityRisks.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(supplierRiskCounts).length} suppliers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High/Critical Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(risksByLevel.high || 0) + (risksByLevel.critical || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((risksByLevel.high || 0) + (risksByLevel.critical || 0)) > 0 ? 
                `${Math.round(((risksByLevel.high || 0) + (risksByLevel.critical || 0)) / highPriorityRisks.length * 100)}% of all risks` : 
                'No high/critical risks'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueSoonRisks.length}</div>
            <p className="text-xs text-muted-foreground">
              Risks due in the next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {highPriorityRisks.filter((r: any) => r.status === 'mitigated' || r.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully addressed risks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and main content */}
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Risks</TabsTrigger>
          <TabsTrigger value="urgent" className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-amber-500" />
            Due Soon
            {dueSoonRisks.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 text-white text-xs px-2">
                {dueSoonRisks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="by-supplier">By Supplier</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="p-0 pt-4">
          <RiskTable 
            risks={highPriorityRisks} 
            isLoading={isHighRiskLoading}
            suppliers={suppliers}
            getRiskLevelBadge={getRiskLevelBadge}
            getRiskTypeBadge={getRiskTypeBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        
        <TabsContent value="urgent" className="p-0 pt-4">
          <RiskTable 
            risks={dueSoonRisks} 
            isLoading={isHighRiskLoading}
            suppliers={suppliers}
            getRiskLevelBadge={getRiskLevelBadge}
            getRiskTypeBadge={getRiskTypeBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
        
        <TabsContent value="by-supplier" className="p-0 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers with Most Risks</CardTitle>
              <CardDescription>
                Focus your risk mitigation efforts on these suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Risk Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isHighRiskLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <span className="text-sm text-muted-foreground mt-2 block">Loading risk data...</span>
                      </TableCell>
                    </TableRow>
                  ) : suppliersWithMostRisks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No suppliers with risks found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliersWithMostRisks.map((supplier: any) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.industry || "-"}</TableCell>
                        <TableCell>{supplier.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={supplier.riskCount > 2 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>
                            {supplier.riskCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Risk Dialog */}
      <Dialog open={isAddRiskOpen} onOpenChange={setIsAddRiskOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Supply Chain Risk</DialogTitle>
            <DialogDescription>
              Document and track a new supply chain risk for a supplier.
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
                  name="riskType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="climate">Climate</SelectItem>
                          <SelectItem value="regulatory">Regulatory</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="economic">Economic</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="geopolitical">Geopolitical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Risk Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the risk in detail..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="potentialImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potential Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the potential business impact..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mitigationPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitigation Plan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the plan to mitigate this risk..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="identified">Identified</SelectItem>
                          <SelectItem value="monitored">Monitored</SelectItem>
                          <SelectItem value="mitigated">Mitigated</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddRiskOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRiskMutation.isPending}
                >
                  {createRiskMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Risk
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Risk Table Component
function RiskTable({ 
  risks, 
  isLoading, 
  suppliers,
  getRiskLevelBadge,
  getRiskTypeBadge,
  getStatusBadge
}: { 
  risks: any[],
  isLoading: boolean,
  suppliers: any[],
  getRiskLevelBadge: (level: string) => JSX.Element,
  getRiskTypeBadge: (type: string) => JSX.Element,
  getStatusBadge: (status: string) => JSX.Element
}) {
  // Create supplier lookup map
  const supplierMap = suppliers.reduce((acc: Record<number, any>, supplier) => {
    acc[supplier.id] = supplier;
    return acc;
  }, {});

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Risk Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <span className="text-sm text-muted-foreground mt-2 block">Loading risks...</span>
                </TableCell>
              </TableRow>
            ) : risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No supply chain risks found</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first risk to start tracking</p>
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk) => {
                const supplier = supplierMap[risk.supplierId];
                const isDueSoon = risk.dueDate && new Date(risk.dueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isOverdue = risk.dueDate && new Date(risk.dueDate) < new Date();
                
                return (
                  <TableRow 
                    key={risk.id}
                    className={
                      isOverdue ? "bg-red-50" : 
                      isDueSoon ? "bg-amber-50" : 
                      ""
                    }
                  >
                    <TableCell className="font-medium">
                      {supplier?.name || `Supplier ID: ${risk.supplierId}`}
                    </TableCell>
                    <TableCell>{getRiskTypeBadge(risk.riskType)}</TableCell>
                    <TableCell>{getRiskLevelBadge(risk.riskLevel)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{risk.description}</div>
                    </TableCell>
                    <TableCell>
                      {risk.dueDate ? (
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className={
                            isOverdue ? "text-red-600 font-medium" : 
                            isDueSoon ? "text-amber-600 font-medium" : 
                            "text-muted-foreground"
                          }>
                            {formatDate(risk.dueDate)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(risk.status)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}