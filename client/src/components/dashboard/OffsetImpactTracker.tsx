import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Car, Cpu, Battery, TreePine, Leaf } from 'lucide-react';

export function OffsetImpactTracker() {
  // Fetch user's offset purchases
  const { data: offsetPurchases, isLoading } = useQuery({
    queryKey: ["/api/offset-purchases"],
    queryFn: async () => {
      const res = await fetch("/api/offset-purchases");
      if (!res.ok) throw new Error("Failed to fetch offset purchases");
      return res.json();
    }
  });
  
  // Calculate total offset amount
  const totalOffset = React.useMemo(() => {
    if (!offsetPurchases) return 0;
    return offsetPurchases.reduce((sum: number, purchase: any) => sum + purchase.amount, 0);
  }, [offsetPurchases]);
  
  // Get total carbon footprint
  const { data: carbonByCategory } = useQuery({
    queryKey: ["/api/carbon-by-category"],
    queryFn: async () => {
      const res = await fetch("/api/carbon-by-category");
      if (!res.ok) throw new Error("Failed to fetch carbon data");
      return res.json();
    }
  });
  
  // Calculate total carbon footprint
  const totalCarbon = React.useMemo(() => {
    if (!carbonByCategory) return 0;
    return carbonByCategory.reduce((sum: number, category: any) => sum + category.totalCarbon, 0);
  }, [carbonByCategory]);
  
  // Calculate the percentage of carbon that has been offset
  const offsetPercentage = totalCarbon > 0 ? (totalOffset / totalCarbon) * 100 : 0;
  
  // Calculate equivalent impact metrics
  const equivalentImpacts = React.useMemo(() => {
    return {
      carMiles: Math.round(totalOffset * 2500), // 2,500 miles per ton of CO2
      smartphones: Math.round(totalOffset * 90), // 90 smartphones charged per ton of CO2
      trees: Math.round(totalOffset * 16.5), // Each ton of CO2 is roughly equivalent to what 16.5 trees absorb annually
      homeEnergy: Math.round(totalOffset * 1.8) // 1.8 months of home energy use per ton of CO2
    };
  }, [totalOffset]);
  
  // Recent offset purchases to display
  const recentPurchases = offsetPurchases?.slice(0, 3) || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Carbon Offset Impact
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-8 bg-neutral-200 rounded"></div>
            <div className="h-24 bg-neutral-200 rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-600">Carbon Offset Progress</span>
                <span className="text-sm font-medium">{offsetPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={offsetPercentage} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neutral-500">{totalOffset.toFixed(2)} tons offset</span>
                <span className="text-xs text-neutral-500">{totalCarbon.toFixed(2)} tons total</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 p-3 rounded-md flex flex-col items-center text-center">
                <TreePine className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-lg font-bold text-green-700">{equivalentImpacts.trees}</span>
                <span className="text-xs text-green-600">Trees planted for a year</span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md flex flex-col items-center text-center">
                <Car className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-lg font-bold text-blue-700">{equivalentImpacts.carMiles.toLocaleString()}</span>
                <span className="text-xs text-blue-600">Car miles avoided</span>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md flex flex-col items-center text-center">
                <Battery className="h-6 w-6 text-amber-600 mb-1" />
                <span className="text-lg font-bold text-amber-700">{equivalentImpacts.smartphones.toLocaleString()}</span>
                <span className="text-xs text-amber-600">Smartphones charged</span>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-md flex flex-col items-center text-center">
                <Cpu className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-lg font-bold text-purple-700">{equivalentImpacts.homeEnergy}</span>
                <span className="text-xs text-purple-600">Months of home energy</span>
              </div>
            </div>
            
            {recentPurchases.length > 0 ? (
              <div>
                <h3 className="font-medium text-sm text-neutral-800 mb-2">Recent Offset Purchases</h3>
                <div className="space-y-3">
                  {recentPurchases.map((purchase: any, index: number) => (
                    <div key={index} className="border rounded-md p-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <Leaf className="h-4 w-4 text-green-500 mr-1" />
                          <span className="font-medium text-sm">{purchase.projectName || "Carbon Offset Project"}</span>
                        </div>
                        <span className="text-xs text-neutral-500">{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 mb-1">
                          {purchase.amount} tons CO₂
                        </Badge>
                        <p className="text-xs text-neutral-500">${purchase.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-neutral-50 rounded-md">
                <Leaf className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
                <p className="text-neutral-600 text-sm">No offset purchases yet.</p>
                <p className="text-neutral-500 text-xs mt-1">
                  Visit the marketplace to offset your carbon footprint.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}