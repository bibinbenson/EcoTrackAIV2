import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MonthlyEmissionsBreakdown() {
  const [year, setYear] = React.useState(new Date().getFullYear().toString());
  
  // Get monthly emissions data
  const { data: monthlyEmissions, isLoading } = useQuery({
    queryKey: ["/api/emissions-by-year", year],
    queryFn: async () => {
      const res = await fetch(`/api/emissions-by-year/${year}`);
      if (!res.ok) throw new Error("Failed to fetch monthly emissions");
      return res.json();
    }
  });
  
  // Get categories for legend 
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Transform data for stacked bar chart
  const transformData = () => {
    if (!monthlyEmissions || !categories) return [];
    
    // Create an array for 12 months with default values
    const monthsData = Array(12).fill(0).map((_, i) => ({
      month: i + 1,
      name: new Date(2022, i, 1).toLocaleString('default', { month: 'short' }),
      // Initialize each category with 0
      ...categories.reduce((acc: Record<string, number>, category: any) => {
        acc[`cat_${category.id}`] = 0;
        return acc;
      }, {})
    }));
    
    // Fill in actual emissions data
    monthlyEmissions.forEach((emission: any) => {
      const monthIndex = emission.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthsData[monthIndex][`cat_${emission.categoryId}`] = emission.carbonAmount;
      }
    });
    
    return monthsData;
  };
  
  const chartData = transformData();
  
  // Calculate the total emissions for the year
  const totalYearlyEmissions = chartData.reduce(
    (sum, month) => {
      let monthTotal = 0;
      Object.keys(month).forEach(key => {
        if (key.startsWith('cat_')) {
          monthTotal += month[key];
        }
      });
      return sum + monthTotal;
    }, 
    0
  );
  
  // Get colors for each category
  const getCategoryColor = (categoryId: number) => {
    const colors = [
      '#3b82f6', // blue
      '#22c55e', // green
      '#f59e0b', // amber
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#ef4444', // red
      '#84cc16'  // lime
    ];
    
    return colors[categoryId % colors.length];
  };
  
  // Get category name by ID
  const getCategoryName = (id: string) => {
    if (!categories) return id;
    const categoryId = parseInt(id.replace('cat_', ''));
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : id;
  };
  
  // Available years for the dropdown (past 5 years)
  const availableYears = Array(5).fill(0).map((_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-neutral-800">
            Monthly Emissions Breakdown
          </CardTitle>
          
          <Select
            value={year}
            onValueChange={setYear}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse h-full w-full bg-neutral-100 rounded-md"></div>
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value.toFixed(2)} tons`, undefined]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend formatter={(value) => getCategoryName(value)} />
                  
                  {categories && categories.map((category: any) => (
                    <Bar 
                      key={category.id}
                      dataKey={`cat_${category.id}`}
                      name={`cat_${category.id}`}
                      stackId="a"
                      fill={getCategoryColor(category.id)}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-neutral-800">Total Emissions</h4>
                <p className="text-2xl font-bold text-neutral-700">{totalYearlyEmissions.toFixed(2)}</p>
                <p className="text-xs text-neutral-600">tons CO₂ in {year}</p>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-neutral-800">Monthly Average</h4>
                <p className="text-2xl font-bold text-neutral-700">
                  {(totalYearlyEmissions / 12).toFixed(2)}
                </p>
                <p className="text-xs text-neutral-600">tons CO₂ per month</p>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-neutral-800">Compared to Average</h4>
                <p className="text-2xl font-bold text-green-700">-12%</p>
                <p className="text-xs text-neutral-600">vs. national average</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}