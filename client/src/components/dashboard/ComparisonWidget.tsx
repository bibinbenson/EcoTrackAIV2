import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";

type ComparisonData = {
  id: string;
  name: string;
  value: number;
  color: string;
};

type ComparisonType = "personal" | "industry" | "regional" | "global";
type TimeRange = "monthly" | "quarterly" | "yearly";

export function ComparisonWidget() {
  const [comparisonType, setComparisonType] = useState<ComparisonType>("personal");
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [averageData, setAverageData] = useState<ComparisonData[]>([]);
  const [percentDifference, setPercentDifference] = useState<number>(0);

  // Fetch user's carbon footprint data
  const { data: userFootprint, isLoading: isLoadingFootprint } = useQuery({
    queryKey: ["/api/carbon-footprint", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/carbon-footprint?timeRange=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch carbon footprint data");
      return res.json();
    },
  });

  // Generate comparison data based on type
  useEffect(() => {
    if (!userFootprint) return;

    let benchmarkValue = 0;
    let benchmarkName = "";
    let benchmarkColor = "#64748b"; // Default color

    // In a real app, these would come from API calls based on the comparison type
    switch (comparisonType) {
      case "personal":
        // Assuming the API returns historical data
        benchmarkValue = userFootprint.previousPeriod || userFootprint.total * 1.2; // Fallback
        benchmarkName = "Your Previous Period";
        benchmarkColor = "#818cf8"; // Indigo
        break;
      case "industry":
        benchmarkValue = userFootprint.total * 1.5; // Simulated industry average
        benchmarkName = "Industry Average";
        benchmarkColor = "#fb7185"; // Rose
        break;
      case "regional":
        benchmarkValue = userFootprint.total * 1.3; // Simulated regional average
        benchmarkName = "Regional Average";
        benchmarkColor = "#fbbf24"; // Amber
        break;
      case "global":
        benchmarkValue = userFootprint.total * 1.8; // Simulated global average
        benchmarkName = "Global Average";
        benchmarkColor = "#10b981"; // Emerald
        break;
    }

    // Calculate percent difference between user's footprint and benchmark
    const diff = ((userFootprint.total - benchmarkValue) / benchmarkValue) * 100;
    setPercentDifference(parseFloat(diff.toFixed(1)));

    // Format data for charts
    setAverageData([
      {
        id: "user",
        name: "Your Footprint",
        value: userFootprint.total,
        color: "#06b6d4", // Cyan
      },
      {
        id: "benchmark",
        name: benchmarkName,
        value: benchmarkValue,
        color: benchmarkColor,
      },
    ]);
  }, [userFootprint, comparisonType, timeRange]);

  const comparisonOptions = [
    { value: "personal", label: "Personal History" },
    { value: "industry", label: "Industry Average" },
    { value: "regional", label: "Regional Average" },
    { value: "global", label: "Global Average" },
  ];

  const timeOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(num);
  };

  return (
    <Card className="col-span-2 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Carbon Footprint Comparison</CardTitle>
          <div className="flex space-x-2">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={comparisonType}
              onValueChange={(value) => setComparisonType(value as ComparisonType)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Compare against" />
              </SelectTrigger>
              <SelectContent>
                {comparisonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Compare your carbon footprint with various benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingFootprint ? (
          <div className="flex flex-col space-y-4 items-center justify-center py-8">
            <div className="h-4 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
        ) : (
          <Tabs defaultValue="bar" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bar" className="space-y-4">
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={averageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis 
                      label={{ 
                        value: "CO₂ Equivalent (kg)", 
                        angle: -90, 
                        position: "insideLeft" 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="value" name="CO₂ Equivalent (kg)">
                      {averageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="top" formatter={formatNumber} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-sm text-neutral-500 mt-2">
                {percentDifference < 0 ? (
                  <p className="text-green-600 font-medium">
                    Your footprint is {Math.abs(percentDifference)}% lower than the {getComparisonLabel(comparisonType)}.
                  </p>
                ) : (
                  <p className="text-red-600 font-medium">
                    Your footprint is {percentDifference}% higher than the {getComparisonLabel(comparisonType)}.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-8">
              {averageData.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-mono">
                      {formatNumber(item.value)} kg CO₂
                    </span>
                  </div>
                  <Progress 
                    value={(item.value / Math.max(...averageData.map(d => d.value))) * 100} 
                    indicatorColor={item.color}
                    className="h-2"
                  />
                </div>
              ))}
              <div className="bg-neutral-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-sm mb-2">
                  What This Means
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="w-4 h-4 inline-block ml-1 text-neutral-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          This comparison helps you understand how your carbon emissions compare to different benchmarks. A lower footprint is better for the environment.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                <p className="text-sm text-neutral-600">
                  {percentDifference < 0 
                    ? `Great job! Your carbon footprint is ${Math.abs(percentDifference)}% lower than the ${getComparisonLabel(comparisonType)}. Keep up the good work!` 
                    : `Your carbon footprint is ${percentDifference}% higher than the ${getComparisonLabel(comparisonType)}. Check out our sustainability tips to learn how to reduce your footprint.`
                  }
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-500">Your Footprint</h4>
                  <p className="text-2xl font-bold mt-1">{formatNumber(averageData[0]?.value || 0)} <span className="text-sm font-normal">kg CO₂</span></p>
                  <p className="text-xs text-neutral-500 mt-1">
                    For the {timeRange} period
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-neutral-500">{getComparisonLabel(comparisonType)}</h4>
                  <p className="text-2xl font-bold mt-1">{formatNumber(averageData[1]?.value || 0)} <span className="text-sm font-normal">kg CO₂</span></p>
                  <p className="text-xs text-neutral-500 mt-1">
                    For the same period
                  </p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg col-span-2">
                  <h4 className="text-sm font-medium text-neutral-500">Difference</h4>
                  <p className={`text-2xl font-bold mt-1 ${percentDifference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {percentDifference < 0 ? '↓' : '↑'} {Math.abs(percentDifference)}%
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {percentDifference < 0 
                      ? 'You are doing better than the benchmark' 
                      : 'You are above the benchmark'
                    }
                  </p>
                </div>
              </div>
              
              <div className="bg-neutral-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-sm mb-2">Reduction Tips</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Reduce standby power consumption by unplugging devices when not in use
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Combine errands to reduce transportation emissions
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    Choose locally sourced foods to reduce food miles
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get a more human-readable label for comparison types
function getComparisonLabel(type: ComparisonType): string {
  switch (type) {
    case "personal":
      return "your previous period";
    case "industry":
      return "industry average";
    case "regional":
      return "regional average";
    case "global":
      return "global average";
    default:
      return "benchmark";
  }
}

// Custom Progress component that allows for color customization
function Progress({ 
  value, 
  className, 
  indicatorColor 
}: { 
  value: number, 
  className?: string,
  indicatorColor?: string
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`relative overflow-hidden rounded-full bg-neutral-200 ${className}`}>
      <div
        className="h-full transition-all duration-700 ease-in-out"
        style={{ 
          width: `${progress}%`, 
          backgroundColor: indicatorColor || '#06b6d4'
        }}
      />
    </div>
  );
}