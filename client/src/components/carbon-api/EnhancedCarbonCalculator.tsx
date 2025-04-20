import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import {
  AlertCircle,
  Layers,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Leaf,
  Lightbulb,
} from "lucide-react";

// Form schema for activity description
const activitySchema = z.object({
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface CarbonAnalysisResult {
  enhancedDescription: string;
  estimatedCategory: string;
  estimatedQuantity: number;
  estimatedUnit: string;
  estimatedCarbonImpact: number;
}

interface CarbonBreakdown {
  scope1: number;
  scope2: number;
  scope3: number;
  totalEmissions: number;
  unit: string;
  activitySpecificFactors: Record<string, number>;
  suggestions: string[];
}

interface EmissionFactor {
  emissionFactor: number;
  unit: string;
  confidence: number;
  source: string;
  notes?: string;
}

export default function EnhancedCarbonCalculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activityId, setActivityId] = useState<number | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CarbonAnalysisResult | null>(null);
  const [emissionFactor, setEmissionFactor] = useState<EmissionFactor | null>(null);

  // Form definition
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: "",
    },
  });

  // API call to analyze activity
  const analyzeActivityMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/carbon/analyze-activity", { description });
      return response.json();
    },
    onSuccess: (data: CarbonAnalysisResult) => {
      setAnalysisResult(data);
      toast({
        title: "Activity Analyzed",
        description: "Carbon impact successfully estimated.",
      });

      // Get emission factor for the analyzed activity
      if (data.estimatedCategory && data.estimatedQuantity && data.estimatedUnit) {
        getEmissionFactorMutation.mutate({
          activity: data.enhancedDescription,
          category: data.estimatedCategory,
          quantity: data.estimatedQuantity,
          unit: data.estimatedUnit
        });
      }
    },
    onError: (error) => {
      console.error("Error analyzing activity:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze carbon activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // API call to get emission factor
  const getEmissionFactorMutation = useMutation({
    mutationFn: async (params: { 
      activity: string; 
      category: string; 
      quantity: number; 
      unit: string 
    }) => {
      const response = await apiRequest("POST", "/api/carbon/emission-factor", params);
      return response.json();
    },
    onSuccess: (data: EmissionFactor) => {
      setEmissionFactor(data);
    },
    onError: (error) => {
      console.error("Error getting emission factor:", error);
    },
  });

  // Save activity to database
  const saveActivityMutation = useMutation({
    mutationFn: async (data: { 
      description: string; 
      categoryId: number; 
      carbonAmount: number;
      date: Date;
    }) => {
      const response = await apiRequest("POST", "/api/activities", data);
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      setActivityId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/carbon-by-category'] });
      toast({
        title: "Activity Saved",
        description: "Your carbon activity has been logged successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving activity:", error);
      toast({
        title: "Save Failed",
        description: "Could not save activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get detailed breakdown for a saved activity
  const { data: breakdown, isLoading: isBreakdownLoading } = useQuery({
    queryKey: ["/api/carbon/activity-breakdown", activityId],
    queryFn: async () => {
      if (!activityId) return null;
      const response = await fetch(`/api/carbon/activity-breakdown/${activityId}`);
      if (!response.ok) throw new Error("Failed to fetch carbon breakdown");
      return response.json();
    },
    enabled: !!activityId && showBreakdown,
  });

  function onSubmit(data: ActivityFormValues) {
    analyzeActivityMutation.mutate(data.description);
  }

  function saveActivity() {
    if (!analysisResult) return;

    // Map the estimated category to category ID
    // This is a simplification - in a real app, you would query categories or have a mapping
    const categoryIdMap: Record<string, number> = {
      "Transport": 1,
      "Energy": 2,
      "Food": 3,
      "Shopping": 4,
      "Home": 5,
    };

    const categoryId = categoryIdMap[analysisResult.estimatedCategory] || 1;

    saveActivityMutation.mutate({
      description: analysisResult.enhancedDescription,
      categoryId,
      carbonAmount: analysisResult.estimatedCarbonImpact,
      date: new Date(),
    });
  }

  const isPending = 
    analyzeActivityMutation.isPending || 
    getEmissionFactorMutation.isPending || 
    saveActivityMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Carbon Calculator</CardTitle>
          <CardDescription>
            Analyze your activities and get detailed carbon emissions data using AI-enhanced calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your activity in detail (e.g., 'Drove 15 miles to work in my electric car' or 'Purchased 2kg of local organic vegetables')"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Analyzing..." : "Analyze Carbon Impact"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Carbon Analysis Results</CardTitle>
            <CardDescription>
              AI-enhanced analysis of your activity's carbon impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Enhanced Description</h3>
              <p className="text-neutral-900">{analysisResult.enhancedDescription}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-500">Category</h3>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {analysisResult.estimatedCategory}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-500">Quantity</h3>
                <p className="text-xl font-mono font-semibold text-neutral-900">
                  {analysisResult.estimatedQuantity} {analysisResult.estimatedUnit}
                </p>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-neutral-500">Carbon Impact</h3>
                <p className="text-xl font-mono font-semibold text-primary">
                  {analysisResult.estimatedCarbonImpact.toFixed(2)} kg CO₂e
                </p>
              </div>
            </div>
            
            {emissionFactor && (
              <div className="mt-4 border rounded-lg p-4">
                <h3 className="text-sm font-medium text-neutral-800 mb-2 flex items-center">
                  <AlertCircle size={16} className="mr-2 text-primary" /> 
                  Emission Factor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Emission Factor</p>
                    <p className="font-mono">{emissionFactor.emissionFactor.toFixed(4)} {emissionFactor.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Confidence</p>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${emissionFactor.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {Math.round(emissionFactor.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-neutral-500">Source</p>
                  <p className="text-sm">{emissionFactor.source}</p>
                </div>
                {emissionFactor.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-neutral-500">Notes</p>
                    <p className="text-sm">{emissionFactor.notes}</p>
                  </div>
                )}
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex justify-end">
              <Button 
                onClick={saveActivity} 
                disabled={saveActivityMutation.isPending || !!activityId}
                className="mr-2"
              >
                {activityId ? "Activity Saved" : saveActivityMutation.isPending ? "Saving..." : "Save Activity"}
              </Button>
              
              {activityId && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  {showBreakdown ? (
                    <>Hide Details <ChevronUp className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Show Details <ChevronDown className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {showBreakdown && activityId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="mr-2 h-5 w-5" />
              Detailed Emission Breakdown
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your carbon footprint across emission scopes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isBreakdownLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : breakdown ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-500">Scope 1 (Direct)</h3>
                    <p className="text-xl font-mono font-semibold text-green-700">
                      {breakdown.scope1.toFixed(2)} {breakdown.unit}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {Math.round((breakdown.scope1 / breakdown.totalEmissions) * 100)}% of total
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-500">Scope 2 (Energy)</h3>
                    <p className="text-xl font-mono font-semibold text-blue-700">
                      {breakdown.scope2.toFixed(2)} {breakdown.unit}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {Math.round((breakdown.scope2 / breakdown.totalEmissions) * 100)}% of total
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-neutral-500">Scope 3 (Indirect)</h3>
                    <p className="text-xl font-mono font-semibold text-amber-700">
                      {breakdown.scope3.toFixed(2)} {breakdown.unit}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {Math.round((breakdown.scope3 / breakdown.totalEmissions) * 100)}% of total
                    </p>
                  </div>
                </div>
                
                {/* Visualization */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-neutral-800 mb-2 flex items-center">
                    <BarChart3 size={16} className="mr-2" /> Emission Distribution
                  </h3>
                  <div className="h-4 w-full rounded-full bg-neutral-100 overflow-hidden flex">
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${(breakdown.scope1 / breakdown.totalEmissions) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-blue-500 h-full" 
                      style={{ width: `${(breakdown.scope2 / breakdown.totalEmissions) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${(breakdown.scope3 / breakdown.totalEmissions) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Scope 1 (Direct)</span>
                    <span>Scope 2 (Energy)</span>
                    <span>Scope 3 (Indirect)</span>
                  </div>
                </div>
                
                {/* Activity-specific factors */}
                {Object.keys(breakdown.activitySpecificFactors).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-neutral-800 mb-2">Activity-Specific Factors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(breakdown.activitySpecificFactors).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b pb-1">
                          <span className="text-sm">{key}</span>
                          <span className="text-sm font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Reduction suggestions */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-neutral-800 mb-2 flex items-center">
                    <Lightbulb size={16} className="mr-2 text-amber-500" /> Reduction Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {breakdown.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-neutral-500">
                No detailed breakdown available
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-neutral-500 border-t p-4">
            Data sourced from AI-enhanced carbon accounting models and emission factor databases.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}