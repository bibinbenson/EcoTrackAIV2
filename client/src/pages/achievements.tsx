import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementProgress from "@/components/achievements/AchievementProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Trophy, Award } from "lucide-react";

// Utility function to calculate level based on score
const calculateLevel = (score: number): number => {
  return Math.floor(score / 100) + 1;
};

export default function AchievementsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");

  // Query for user data
  const { data: user, isLoading: isLoadingUser } = useQuery({ 
    queryKey: ["/api/users/me"]
  });

  // Query for all achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/achievements"],
  });

  // Query for user's achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
  });

  // Filtering logic
  const filterAchievements = (achievementList: any[] = []) => {
    if (!filter) return achievementList;
    
    return achievementList.filter(achievement => 
      achievement.name.toLowerCase().includes(filter.toLowerCase()) || 
      achievement.description.toLowerCase().includes(filter.toLowerCase())
    );
  };

  // Group achievements by completion status
  const getAchievementGroups = () => {
    if (!achievements) return { completed: [], inProgress: [], locked: [] };
    
    const completed: any[] = [];
    const inProgress: any[] = [];
    const locked: any[] = [];
    
    achievements.forEach((achievement: any) => {
      const userAchievement = userAchievements?.find(
        (ua: any) => ua.achievementId === achievement.id
      );
      
      if (userAchievement?.isCompleted) {
        completed.push({ ...achievement, userAchievement });
      } else if (userAchievement) {
        inProgress.push({ ...achievement, userAchievement });
      } else {
        locked.push({ ...achievement });
      }
    });
    
    return { completed, inProgress, locked };
  };

  const { completed, inProgress, locked } = getAchievementGroups();
  
  // Stats calculation
  const totalAchievements = achievements?.length || 0;
  const completedCount = completed.length;
  const userScore = user?.score || 0;
  const userLevel = calculateLevel(userScore);

  // Loading state
  if (isLoadingUser || isLoadingAchievements || isLoadingUserAchievements) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading achievements...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="h-8 w-8 mr-2 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete challenges and earn rewards for your sustainability efforts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter achievements..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-auto max-w-[250px]"
          />
        </div>
      </div>

      {/* User progress section */}
      <div className="mb-8">
        <AchievementProgress
          totalAchievements={totalAchievements}
          completedAchievements={completedCount}
          score={userScore}
          level={userLevel}
        />
      </div>

      {/* Achievements tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({achievements?.length || 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({locked.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filterAchievements(achievements)?.length === 0 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No achievements found</AlertTitle>
              <AlertDescription>
                No achievements match your filter criteria.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filterAchievements(achievements)?.map((achievement: any) => {
              const userAchievement = userAchievements?.find(
                (ua: any) => ua.achievementId === achievement.id
              );
              
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={userAchievement}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {filterAchievements(completed).length === 0 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No achievements completed yet</AlertTitle>
              <AlertDescription>
                Keep working on your sustainability goals to earn achievements.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filterAchievements(completed).map((achievement: any) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                userAchievement={achievement.userAchievement}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-0">
          {filterAchievements(inProgress).length === 0 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No achievements in progress</AlertTitle>
              <AlertDescription>
                Start working on achievements to track your progress here.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filterAchievements(inProgress).map((achievement: any) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                userAchievement={achievement.userAchievement}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-0">
          {filterAchievements(locked).length === 0 && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No locked achievements</AlertTitle>
              <AlertDescription>
                You've started all available achievements.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filterAchievements(locked).map((achievement: any) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-6 bg-primary/5 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Award className="h-12 w-12 text-primary" />
          <div>
            <h3 className="text-xl font-bold">Ready to Earn Rewards?</h3>
            <p className="text-muted-foreground mt-1">
              Complete achievements to earn eco-points. Visit the rewards page to redeem your points for eco-friendly rewards.
            </p>
          </div>
          <Button className="md:ml-auto" onClick={() => window.location.href = '/rewards'}>
            View Rewards
          </Button>
        </div>
      </div>
    </div>
  );
}