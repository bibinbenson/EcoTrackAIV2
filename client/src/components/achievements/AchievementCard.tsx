import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Lock, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";

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

export default function AchievementCard({ achievement, userAchievement }: AchievementCardProps) {
  // Get icon based on achievement iconName or default to Trophy
  const getIcon = () => {
    switch (achievement.iconName) {
      case "award":
        return <Award className="h-12 w-12 text-primary" />;
      case "trending-up":
        return <TrendingUp className="h-12 w-12 text-primary" />;
      case "check-circle":
        return <CheckCircle2 className="h-12 w-12 text-primary" />;
      default:
        return <Trophy className="h-12 w-12 text-primary" />;
    }
  };

  // Get formatted threshold description
  const getThresholdDescription = () => {
    switch (achievement.thresholdType) {
      case "consecutive_days":
        return `Log activities for ${achievement.thresholdValue} consecutive days`;
      case "carbon_reduction":
        return `Reduce carbon emissions by ${achievement.thresholdValue} kg`;
      case "total_activities":
        return `Log ${achievement.thresholdValue} total activities`;
      case "transport_activities":
        return `Log ${achievement.thresholdValue} transportation activities`;
      case "monthly_reduction":
        return `Reduce monthly emissions by ${achievement.thresholdValue}%`;
      default:
        return `Reach threshold of ${achievement.thresholdValue}`;
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!userAchievement) return 0;
    if (userAchievement.isCompleted) return 100;
    return Math.min(100, Math.round((userAchievement.progress / achievement.thresholdValue) * 100));
  };

  const progressPercentage = calculateProgress();

  return (
    <Card className={`overflow-hidden ${userAchievement?.isCompleted ? 'border-primary' : 'border-muted'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{achievement.name}</CardTitle>
          {userAchievement?.isCompleted ? (
            <Badge className="bg-primary text-primary-foreground">
              Completed
            </Badge>
          ) : (
            <Badge variant="outline">In Progress</Badge>
          )}
        </div>
        <CardDescription>
          {getThresholdDescription()}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-center my-4">
          {userAchievement?.isCompleted ? (
            <div className="relative">
              {getIcon()}
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>
          ) : !userAchievement ? (
            <div className="relative opacity-30">
              {getIcon()}
              <div className="absolute -top-1 -right-1 bg-muted-foreground rounded-full p-1">
                <Lock className="h-4 w-4 text-background" />
              </div>
            </div>
          ) : (
            getIcon()
          )}
        </div>
        
        <p className="text-sm text-center">{achievement.description}</p>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {userAchievement ? userAchievement.progress : 0}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {achievement.thresholdValue}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{progressPercentage}% complete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {userAchievement?.dateEarned && userAchievement.isCompleted && (
          <div className="mt-3 text-xs text-center text-muted-foreground">
            Earned on {new Date(userAchievement.dateEarned).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}