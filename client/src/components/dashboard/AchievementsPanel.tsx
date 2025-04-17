import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, Award, Bike } from "lucide-react";

export default function AchievementsPanel() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["/api/user-achievements"],
    queryFn: async () => {
      const res = await fetch("/api/user-achievements");
      if (!res.ok) throw new Error("Failed to fetch achievements");
      return res.json();
    }
  });

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "leaf":
        return <Leaf className="text-green-600" />;
      case "award":
        return <Award className="text-blue-600" />;
      case "bicycle":
        return <Bike className="text-neutral-600" />;
      default:
        return <Award className="text-blue-600" />;
    }
  };

  const renderAchievementItem = (achievement: any) => {
    const isComplete = achievement.isCompleted;
    
    return (
      <div 
        key={achievement.id} 
        className={`flex items-center p-3 rounded-lg ${
          isComplete ? "bg-green-50" : "bg-neutral-50"
        }`}
      >
        <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full ${
          isComplete ? "bg-green-100" : "bg-neutral-200"
        }`}>
          {getAchievementIcon(achievement.achievement.iconName)}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-neutral-800">
            {achievement.achievement.name}
          </h4>
          <p className="text-xs text-neutral-600">
            {achievement.achievement.description}
          </p>
          
          {!isComplete && (
            <>
              <p className="text-xs text-neutral-600">
                Progress: {achievement.progress}/{achievement.achievement.thresholdValue}
              </p>
              <Progress 
                value={(achievement.progress / achievement.achievement.thresholdValue) * 100} 
                className="h-1.5 mt-1"
              />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Your Achievements
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-3 bg-neutral-50 rounded-lg animate-pulse">
                <div className="h-12 w-12 rounded-full bg-neutral-200"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 w-36 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : achievements?.length ? (
          <div className="flex flex-col space-y-4">
            {achievements.map(renderAchievementItem)}
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-500">
            <Award className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p>No achievements yet. Start tracking to earn them!</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full hover:border-primary hover:text-primary"
        >
          View All Achievements
        </Button>
      </CardFooter>
    </Card>
  );
}
