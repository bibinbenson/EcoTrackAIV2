import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User } from "@shared/schema";
import { Trophy, Users, Award, Leaf, Target, TrendingUp } from "lucide-react";

export default function Community() {
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all-time");
  
  // Fetch top users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users/top", 20],
    queryFn: async () => {
      const res = await fetch("/api/users/top?limit=20");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    }
  });
  
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });
  
  // Calculate user position
  const getCurrentUserPosition = () => {
    if (!users || !currentUser) return null;
    
    return users.findIndex((user: User) => user.id === currentUser.id) + 1;
  };
  
  const userPosition = getCurrentUserPosition();
  
  // Get badge for top positions
  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-amber-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-neutral-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="font-mono font-bold text-lg text-neutral-600">{position}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800">Community Leaderboard</h2>
        <p className="text-neutral-600 mt-1">
          See how you rank among other EcoTrack users and compete for the top spots
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Community Members</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">
                  {isLoading ? "..." : users.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-600">Your Rank</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">
                  {userPosition !== null ? `#${userPosition}` : "N/A"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-600">Your Score</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">
                  {currentUser?.score || "..."}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Leaf className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-600">Community Goal</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">
                  75%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Target className="h-6 w-6" />
              </div>
            </div>
            <Progress value={75} className="mt-3" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-neutral-800">
                  Leaderboard Rankings
                </CardTitle>
                
                <Tabs 
                  value={leaderboardPeriod}
                  onValueChange={setLeaderboardPeriod}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all-time">All Time</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Users ranked by their carbon impact score
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center p-3 animate-pulse">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                        <div className="h-3 w-24 mt-1 bg-neutral-200 rounded"></div>
                      </div>
                      <div className="h-6 w-12 bg-neutral-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user: User, index: number) => {
                    const position = index + 1;
                    const isCurrentUser = currentUser && user.id === currentUser.id;
                    
                    return (
                      <div 
                        key={user.id} 
                        className={`flex items-center p-3 rounded-lg ${
                          isCurrentUser ? "bg-primary bg-opacity-5" : 
                          position <= 3 ? "bg-neutral-50" : ""
                        }`}
                      >
                        <div className="w-8 flex justify-center">
                          {getPositionBadge(position)}
                        </div>
                        
                        <img 
                          className="h-10 w-10 rounded-full ml-2" 
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                        
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-neutral-800">
                            {isCurrentUser ? (
                              <span className="font-bold">You</span>
                            ) : (
                              `${user.firstName} ${user.lastName}`
                            )}
                            
                            {position <= 3 && (
                              <Badge 
                                variant="outline" 
                                className={`ml-2 ${
                                  position === 1 ? "border-amber-500 text-amber-500" :
                                  position === 2 ? "border-neutral-400 text-neutral-500" :
                                  "border-amber-700 text-amber-700"
                                }`}
                              >
                                {position === 1 ? "Gold" : position === 2 ? "Silver" : "Bronze"}
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {Math.floor(Math.random() * 100) + 1} activities tracked
                          </p>
                        </div>
                        
                        <div className="font-mono font-bold text-lg text-primary">
                          {user.score}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t pt-4">
              <p className="text-sm text-neutral-600">
                Scores are calculated based on your carbon reduction actions and activity tracking.
                <Button variant="link" className="h-auto p-0 text-sm" onClick={() => {}}>
                  Learn how scoring works
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Community Challenges */}
        <div>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-neutral-800">
                Community Challenges
              </CardTitle>
              <CardDescription>
                Join challenges to earn extra points
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-4">
              <div className="border border-neutral-200 hover:border-primary rounded-lg p-4 transition-colors">
                <div className="flex justify-between">
                  <h3 className="font-bold text-neutral-800">No-Car Week</h3>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                </div>
                <p className="text-sm text-neutral-600 my-2">
                  Avoid using your car for an entire week and log alternative transportation methods.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-neutral-600">Participants:</span>
                    <span className="font-medium ml-1">127</span>
                  </div>
                  <Button size="sm">Join Challenge</Button>
                </div>
              </div>
              
              <div className="border border-neutral-200 hover:border-primary rounded-lg p-4 transition-colors">
                <div className="flex justify-between">
                  <h3 className="font-bold text-neutral-800">Plant-Based Diet</h3>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Upcoming</Badge>
                </div>
                <p className="text-sm text-neutral-600 my-2">
                  Eat plant-based meals for 14 days and track your food carbon footprint reduction.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-neutral-600">Starts in:</span>
                    <span className="font-medium ml-1">3 days</span>
                  </div>
                  <Button size="sm" variant="outline">Remind Me</Button>
                </div>
              </div>
              
              <div className="border border-neutral-200 hover:border-primary rounded-lg p-4 transition-colors">
                <div className="flex justify-between">
                  <h3 className="font-bold text-neutral-800">Energy Savers</h3>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Upcoming</Badge>
                </div>
                <p className="text-sm text-neutral-600 my-2">
                  Reduce your home energy usage by 20% compared to your previous month.
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-neutral-600">Starts in:</span>
                    <span className="font-medium ml-1">9 days</span>
                  </div>
                  <Button size="sm" variant="outline">Remind Me</Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                View All Challenges
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-neutral-800">
                Community Impact
              </CardTitle>
              <CardDescription>
                Our collective environmental impact
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-4">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Carbon Reduced</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      24.5 tons
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Activities Logged</p>
                    <p className="text-2xl font-bold text-neutral-800">
                      3,782
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-bold text-neutral-800 mb-2">Community Goal</h4>
                <p className="text-sm text-neutral-600 mb-3">
                  Reduce our collective carbon footprint by 30 tons this month
                </p>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-neutral-600">
                  <span>0 tons</span>
                  <span>24.5 / 30 tons</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
