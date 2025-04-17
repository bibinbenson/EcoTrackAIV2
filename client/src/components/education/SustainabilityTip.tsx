import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { SustainabilityTip as TipType } from "@shared/schema";

interface SustainabilityTipProps {
  categoryId?: number;
}

export default function SustainabilityTip({ categoryId }: SustainabilityTipProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Fetch all sustainability tips
  const { data: tips = [], isLoading } = useQuery({
    queryKey: ["/api/sustainability-tips", categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/api/sustainability-tips?categoryId=${categoryId}`
        : "/api/sustainability-tips";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch sustainability tips");
      return res.json();
    }
  });
  
  // Fetch categories for styling
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Get a new random tip
  const getRandomTip = () => {
    if (tips.length <= 1) return;
    
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * tips.length);
    } while (newIndex === currentTipIndex);
    
    setCurrentTipIndex(newIndex);
  };
  
  // Get category details for a tip
  const getCategoryForTip = (tip: TipType) => {
    if (!categories) return null;
    return categories.find((cat: any) => cat.id === tip.categoryId);
  };
  
  // Current tip to display
  const currentTip = tips[currentTipIndex];
  const tipCategory = currentTip ? getCategoryForTip(currentTip) : null;
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Sustainability Tip
        </CardTitle>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={getRandomTip}
          disabled={isLoading || tips.length <= 1}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Get new tip</span>
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-24 bg-neutral-200 rounded"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
          </div>
        ) : !currentTip ? (
          <div className="text-center py-4 text-neutral-500">
            <p>No sustainability tips available</p>
          </div>
        ) : (
          <div 
            className="p-4 rounded-lg" 
            style={{ 
              backgroundColor: tipCategory ? `${tipCategory.color}10` : 'rgba(76, 175, 80, 0.1)'
            }}
          >
            <h3 
              className="text-base font-bold mb-2" 
              style={{ 
                color: tipCategory ? tipCategory.color : '#4CAF50' 
              }}
            >
              {currentTip.title}
            </h3>
            
            <p className="text-sm text-neutral-800 mb-3">
              {currentTip.content}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">
                Potential impact: <span className="font-mono font-medium">-{currentTip.potentialImpact}kg CO₂/month</span>
              </span>
              
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm font-medium"
                style={{ 
                  color: tipCategory ? tipCategory.color : '#4CAF50' 
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
        
        {tips.length > 1 && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">
                Tip {currentTipIndex + 1} of {tips.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={getRandomTip}
              >
                Show Another Tip
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
