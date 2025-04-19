import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CO2ReductionForecast() {
  // Get the user's current carbon data
  const { data: carbonByCategory, isLoading: isLoadingCarbon } = useQuery({
    queryKey: ["/api/carbon-by-category"],
    queryFn: async () => {
      const res = await fetch("/api/carbon-by-category");
      if (!res.ok) throw new Error("Failed to fetch carbon data");
      return res.json();
    }
  });
  
  // Function to generate forecast data based on current carbon footprint
  const generateForecastData = () => {
    if (!carbonByCategory) return [];
    
    // Calculate current total carbon emissions
    const currentTotal = carbonByCategory.reduce((sum: number, category: any) => sum + category.totalCarbon, 0);
    
    // Create forecast with different reduction scenarios
    const noChange = Array(12).fill(0).map((_, i) => ({
      month: i + 1,
      noChange: currentTotal,
      moderate: currentTotal,
      aggressive: currentTotal
    }));
    
    // Apply reduction rates
    // - Moderate: 3% reduction per month
    // - Aggressive: 6% reduction per month
    return noChange.map((point, i) => {
      if (i === 0) return point;
      
      const prevMonth = noChange[i-1];
      return {
        month: point.month,
        noChange: prevMonth.noChange,
        moderate: prevMonth.moderate * 0.97, // 3% monthly reduction
        aggressive: prevMonth.aggressive * 0.94 // 6% monthly reduction
      };
    });
  };
  
  const forecastData = generateForecastData();
  
  // Calculate projected annual savings
  const calculateAnnualSavings = () => {
    if (forecastData.length === 0) return { moderate: 0, aggressive: 0 };
    
    const initialValue = forecastData[0]?.noChange || 0;
    const lastMonthModerate = forecastData[forecastData.length - 1]?.moderate || 0;
    const lastMonthAggressive = forecastData[forecastData.length - 1]?.aggressive || 0;
    
    return {
      moderate: (initialValue - lastMonthModerate) * 12, // Annual savings
      aggressive: (initialValue - lastMonthAggressive) * 12
    };
  };
  
  const annualSavings = calculateAnnualSavings();
  
  // Format month labels
  const formatMonth = (month: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + month - 1);
    return date.toLocaleString('default', { month: 'short' });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-neutral-800">
            CO₂ Reduction Forecast
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div>
                  <Info className="h-4 w-4 text-neutral-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-xs">
                  This chart shows potential carbon reduction scenarios based on your current footprint:
                  <br />
                  • No change: continuing current behavior
                  <br />
                  • Moderate: 3% monthly reduction
                  <br />
                  • Aggressive: 6% monthly reduction
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoadingCarbon ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse h-full w-full bg-neutral-100 rounded-md"></div>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(2)} tons`, undefined]}
                    labelFormatter={(label) => `Month: ${formatMonth(label)}`}
                  />
                  <Legend iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="noChange"
                    name="No Change"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="moderate"
                    name="Moderate Reduction"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="aggressive"
                    name="Aggressive Reduction"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-green-800">Moderate Plan Savings</h4>
                <p className="text-2xl font-bold text-green-700">{annualSavings.moderate.toFixed(2)}</p>
                <p className="text-xs text-green-600">tons CO₂ per year</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-800">Aggressive Plan Savings</h4>
                <p className="text-2xl font-bold text-blue-700">{annualSavings.aggressive.toFixed(2)}</p>
                <p className="text-xs text-blue-600">tons CO₂ per year</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}