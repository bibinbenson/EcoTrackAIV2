import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Leaf, TrendingUp } from "lucide-react";

interface ESGActionProps {
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category: string;
  roi?: string;
  carbonReduction: number;
  difficulty: "easy" | "moderate" | "challenging";
  onClick: () => void;
}

export default function ESGActionCard({
  title,
  description,
  impact,
  category,
  roi,
  carbonReduction,
  difficulty,
  onClick
}: ESGActionProps) {
  
  // Style based on impact level
  const getImpactColor = () => {
    switch(impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Style based on difficulty
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-amber-100 text-amber-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <Badge variant="outline" className={getImpactColor()}>
            {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          {category}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-neutral-700">{description}</p>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded">
            <span className="text-xs text-neutral-500">Carbon Reduction</span>
            <div className="flex items-center mt-1">
              <Leaf className="h-3 w-3 text-green-500 mr-1" />
              <span className="font-semibold text-sm">
                {carbonReduction} kg CO₂
              </span>
            </div>
          </div>
          
          {roi && (
            <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded">
              <span className="text-xs text-neutral-500">ROI</span>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                <span className="font-semibold text-sm">{roi}</span>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded">
            <span className="text-xs text-neutral-500">Difficulty</span>
            <Badge variant="outline" className={`mt-1 ${getDifficultyColor()}`}>
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={onClick} 
          className="w-full"
          variant="outline"
        >
          Learn More
          <ArrowUpRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}