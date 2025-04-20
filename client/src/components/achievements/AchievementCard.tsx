import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Trophy,
  Zap,
  Star,
  Leaf
} from "lucide-react";

interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    iconName: string;
    thresholdValue: number;
    thresholdType: string;
  };
  userAchievement?: {
    progress: number;
    isCompleted: boolean;
    dateEarned?: string;
  };
}

// Helper function to format dates nicely
const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Helper to get the appropriate icon based on iconName
const getAchievementIcon = (iconName: string) => {
  switch (iconName) {
    case "award":
      return <Award className="h-6 w-6" />;
    case "check-circle":
      return <CheckCircle className="h-6 w-6" />;
    case "trending-up":
      return <TrendingUp className="h-6 w-6" />;
    case "trophy":
      return <Trophy className="h-6 w-6" />;
    case "zap":
      return <Zap className="h-6 w-6" />;
    case "star":
      return <Star className="h-6 w-6" />;
    case "leaf":
      return <Leaf className="h-6 w-6" />;
    default:
      return <Award className="h-6 w-6" />;
  }
};

// Helper to get a human-readable threshold type
const getThresholdTypeLabel = (thresholdType: string) => {
  switch (thresholdType) {
    case "total_activities":
      return "Activities";
    case "transport_activities":
      return "Transport Activities";
    case "consecutive_days":
      return "Consecutive Days";
    case "carbon_reduction":
      return "kg CO₂ Reduced";
    case "monthly_reduction":
      return "% Monthly Reduction";
    default:
      return thresholdType.replace(/_/g, " ");
  }
};

export default function AchievementCard({ achievement, userAchievement }: AchievementCardProps) {
  const { name, description, iconName, thresholdValue, thresholdType } = achievement;
  
  // Calculate progress percentage
  const progress = userAchievement?.progress || 0;
  const progressPercentage = Math.min(
    Math.round((progress / thresholdValue) * 100),
    100
  );
  
  // Determine the card's visual state based on completion
  const isCompleted = userAchievement?.isCompleted || false;
  const isLocked = !userAchievement;
  
  return (
    <Card className={`relative overflow-hidden transition-all ${
      isCompleted 
        ? "border-green-500 bg-gradient-to-b from-green-50 to-transparent" 
        : isLocked 
          ? "opacity-75 border-gray-300 bg-gray-50"
          : "border-primary/20"
    }`}>
      {isCompleted && (
        <div className="absolute top-0 right-0">
          <Badge variant="outline" className="m-2 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isCompleted 
              ? "bg-green-100 text-green-600" 
              : isLocked 
                ? "bg-gray-100 text-gray-400"
                : "bg-primary/10 text-primary"
          }`}>
            {getAchievementIcon(iconName)}
          </div>
          <div>
            <CardTitle className={`text-lg ${isLocked ? "text-gray-500" : ""}`}>
              {name}
            </CardTitle>
            <CardDescription className={isLocked ? "text-gray-400" : ""}>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-sm">
            <span className={isLocked ? "text-gray-400" : "text-gray-600"}>
              Target: {thresholdValue} {getThresholdTypeLabel(thresholdType)}
            </span>
            <span className={isLocked ? "text-gray-400" : "text-gray-600"}>
              {isLocked ? "0" : progress}/{thresholdValue}
            </span>
          </div>
          <Progress 
            value={isLocked ? 0 : progressPercentage} 
            className={`h-2 ${isCompleted ? "bg-green-100" : isLocked ? "bg-gray-100" : ""}`}
          />
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <div className="w-full text-xs text-gray-500 flex items-center">
          {isCompleted ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              Earned on {formatDate(userAchievement?.dateEarned)}
            </>
          ) : isLocked ? (
            <>
              <Clock className="h-3 w-3 mr-1" />
              Achievement locked
            </>
          ) : (
            <>
              <TrendingUp className="h-3 w-3 mr-1 text-primary" />
              In progress • {progressPercentage}% complete
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}