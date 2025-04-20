import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDefaultMonthlyFootprint, getCommunityAverageFootprint } from "@/lib/carbon-calculations";

// Time periods for chart display
const TIME_PERIODS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" }
];

interface ChartToolTipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartToolTipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-neutral-200">
        <p className="font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p 
            key={`item-${index}`} 
            style={{ color: entry.color }}
            className="text-sm"
          >
            {entry.name}: {entry.value} kg CO₂
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CarbonFootprintChart() {
  const [period, setPeriod] = useState("month");
  
  // In a real app, this would fetch actual carbon data for different time periods
  // For now we'll use simulation data
  const { data, isLoading } = useQuery({
    queryKey: ["/carbon-chart", period],
    queryFn: async () => {
      // This is just for simulation - in a real app this would come from the API
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const userFootprint = getDefaultMonthlyFootprint();
      const communityAverage = getCommunityAverageFootprint();
      
      return months.map((month, index) => ({
        month,
        "Your Carbon Footprint": userFootprint[index],
        "Community Average": communityAverage[index]
      }));
    }
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-neutral-800">Carbon Footprint</h3>
          <div className="flex space-x-2">
            {TIME_PERIODS.map((timePeriod) => (
              <Button
                key={timePeriod.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-sm rounded",
                  period === timePeriod.value 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-neutral-600 hover:text-primary"
                )}
                onClick={() => setPeriod(timePeriod.value)}
              >
                {timePeriod.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(224, 224, 224, 0.5)" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${value} kg`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ paddingBottom: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="Your Carbon Footprint"
                  stroke="rgb(46, 125, 50)"
                  fill="rgba(46, 125, 50, 0.1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Community Average"
                  stroke="rgba(117, 117, 117, 0.5)"
                  fill="transparent"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
