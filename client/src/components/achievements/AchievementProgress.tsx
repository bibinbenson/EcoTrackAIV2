import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Medal, Trophy } from "lucide-react";

interface AchievementProgressProps {
  totalAchievements: number;
  completedAchievements: number;
  score: number;
  level: number; // Calculated level based on score
}

export default function AchievementProgress({
  totalAchievements,
  completedAchievements,
  score,
  level
}: AchievementProgressProps) {
  // Calculate percentage completion
  const completionPercentage = totalAchievements > 0
    ? Math.round((completedAchievements / totalAchievements) * 100)
    : 0;
    
  // Calculate points needed for next level (simple formula: 100 points per level)
  const pointsForNextLevel = (level + 1) * 100;
  const pointsInCurrentLevel = score % 100;
  const levelProgressPercentage = Math.round((pointsInCurrentLevel / 100) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Achievements Progress</CardTitle>
          <CardDescription>Track your achievements completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm font-medium">{completedAchievements} / {totalAchievements}</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
          
          <div className="text-sm text-center text-muted-foreground">
            {completionPercentage}% of achievements unlocked
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Level {level}</CardTitle>
          <CardDescription>Earn points to level up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Medal className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Level Progress</span>
                <span className="text-sm font-medium">{pointsInCurrentLevel} / 100</span>
              </div>
              <Progress value={levelProgressPercentage} className="h-2" />
            </div>
          </div>
          
          <div className="text-sm text-center text-muted-foreground">
            {pointsForNextLevel - score} more points to reach level {level + 1}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}