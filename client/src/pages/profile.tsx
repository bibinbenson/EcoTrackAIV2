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
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Award, 
  Clock, 
  Calendar,
  Share2,
  Download,
  Settings,
  ChevronRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });
  
  // Fetch user achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    queryFn: async () => {
      const res = await fetch("/api/user-achievements");
      if (!res.ok) throw new Error("Failed to fetch user achievements");
      return res.json();
    }
  });
  
  // Fetch recent activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/activities/recent", 10],
    queryFn: async () => {
      const res = await fetch("/api/activities/recent?limit=10");
      if (!res.ok) throw new Error("Failed to fetch recent activities");
      return res.json();
    }
  });
  
  // Get count of completed achievements
  const getCompletedAchievementsCount = () => {
    if (!achievements) return 0;
    return achievements.filter((a: any) => a.isCompleted).length;
  };
  
  // Get count of activities
  const getActivitiesCount = () => {
    if (!activities) return 0;
    return activities.length;
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-neutral-800 leading-7 sm:truncate">
            My Profile
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* User Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {isLoadingUser ? (
                  <div className="h-24 w-24 rounded-full bg-neutral-200 animate-pulse"></div>
                ) : (
                  <img 
                    src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=96&background=random`} 
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-24 w-24 rounded-full"
                  />
                )}
                
                <div className="mt-4 text-center">
                  {isLoadingUser ? (
                    <>
                      <div className="h-6 w-32 bg-neutral-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 w-24 bg-neutral-200 rounded mx-auto animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-neutral-800">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-neutral-600">@{user?.username}</p>
                    </>
                  )}
                </div>
                
                <div className="mt-6 border border-neutral-200 rounded-lg p-4 w-full">
                  <div className="flex justify-between">
                    <div className="text-center flex-1">
                      <p className="text-sm text-neutral-600">Carbon Score</p>
                      <p className="text-xl font-bold text-primary">{user?.score || "..."}</p>
                    </div>
                    <div className="text-center flex-1 border-l border-neutral-200">
                      <p className="text-sm text-neutral-600">Achievements</p>
                      <p className="text-xl font-bold text-amber-500">
                        {isLoadingAchievements ? "..." : getCompletedAchievementsCount()}
                      </p>
                    </div>
                    <div className="text-center flex-1 border-l border-neutral-200">
                      <p className="text-sm text-neutral-600">Activities</p>
                      <p className="text-xl font-bold text-blue-500">
                        {isLoadingActivities ? "..." : getActivitiesCount()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-4 flex justify-center">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
            </CardFooter>
          </Card>
          
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-neutral-800">
                My Stats
              </CardTitle>
              <CardDescription>
                Your environmental impact overview
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-3">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Highest Achievement</p>
                    <p className="font-medium text-neutral-800">Carbon Reducer</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Last Activity</p>
                    <p className="font-medium text-neutral-800">
                      {activities && activities[0] ? (
                        formatDate(activities[0].date)
                      ) : (
                        "No activities yet"
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Member Since</p>
                    <p className="font-medium text-neutral-800">June 2023</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Connected Accounts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-neutral-800">
                Connected Services
              </CardTitle>
              <CardDescription>
                Sync data with other platforms
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </div>
                    <span className="font-medium text-neutral-800">Twitter</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Connect
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <span className="font-medium text-neutral-800">GitHub</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Connect
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                    </div>
                    <span className="font-medium text-neutral-800">Facebook</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Carbon Footprint Summary</h3>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Current Month</p>
                        <p className="text-2xl font-bold text-primary">42 kg CO₂</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Previous Month</p>
                        <p className="text-2xl font-bold text-neutral-800">65 kg CO₂</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600">Monthly Trend</p>
                        <p className="text-2xl font-bold text-green-600">-35%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Recent Activity</h3>
                  
                  {isLoadingActivities ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border border-neutral-200 rounded-lg animate-pulse">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                              <div className="ml-3">
                                <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                                <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                              </div>
                            </div>
                            <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !activities || activities.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <p>No activities logged yet. Use the calculator to log your first activity!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 3).map((activity: any) => (
                        <div key={activity.id} className="p-3 border border-neutral-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-neutral-800">{activity.description}</h4>
                              <p className="text-sm text-neutral-600">{formatDate(activity.date)}</p>
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {activity.carbonAmount.toFixed(2)} kg
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {activities.length > 3 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-primary"
                          onClick={() => setActiveTab("activities")}
                        >
                          View All Activities
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-4">Achievements Showcase</h3>
                  
                  {isLoadingAchievements ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-neutral-200 rounded-lg animate-pulse">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
                            <div className="ml-3">
                              <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                              <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !achievements || achievements.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <p>No achievements yet. Start tracking to earn achievements!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements
                        .filter((a: any) => a.isCompleted)
                        .slice(0, 4)
                        .map((achievement: any) => (
                          <div key={achievement.id} className="p-4 border border-neutral-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <Award className="h-6 w-6" />
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-neutral-800">
                                  {achievement.achievement.name}
                                </h4>
                                <p className="text-sm text-neutral-600">
                                  {achievement.achievement.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {achievements.filter((a: any) => a.isCompleted).length > 4 && (
                        <Button 
                          variant="ghost" 
                          className="w-full text-primary"
                          onClick={() => setActiveTab("achievements")}
                        >
                          View All Achievements
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="activities" className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">All Activities</h3>
                
                {isLoadingActivities ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-3 border border-neutral-200 rounded-lg animate-pulse">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                            <div className="ml-3">
                              <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                              <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                            </div>
                          </div>
                          <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !activities || activities.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <UserIcon className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-800">No Activities Yet</h3>
                    <p className="mt-1 text-neutral-600">
                      Start tracking your carbon footprint by logging activities
                    </p>
                    <Button className="mt-4">Log First Activity</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="p-3 border border-neutral-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-neutral-800">{activity.description}</h4>
                            <p className="text-sm text-neutral-600">{formatDate(activity.date)}</p>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {activity.carbonAmount.toFixed(2)} kg
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="achievements" className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-800 mb-4">All Achievements</h3>
                
                {isLoadingAchievements ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 border border-neutral-200 rounded-lg animate-pulse">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-neutral-200 rounded-full"></div>
                          <div className="ml-3 flex-1">
                            <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                            <div className="h-3 w-full bg-neutral-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !achievements || achievements.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-lg">
                    <Award className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-lg font-medium text-neutral-800">No Achievements Yet</h3>
                    <p className="mt-1 text-neutral-600">
                      Continue using the app to earn achievements
                    </p>
                    <Button className="mt-4">View Available Achievements</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-medium text-neutral-800">Completed</h4>
                      
                      {achievements.filter((a: any) => a.isCompleted).length === 0 ? (
                        <p className="text-sm text-neutral-600">No completed achievements yet</p>
                      ) : (
                        achievements
                          .filter((a: any) => a.isCompleted)
                          .map((achievement: any) => (
                            <div key={achievement.id} className="p-4 border border-neutral-200 rounded-lg bg-green-50">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                                  <Award className="h-6 w-6" />
                                </div>
                                <div className="ml-3">
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-neutral-800">
                                      {achievement.achievement.name}
                                    </h4>
                                    <Badge className="ml-2 bg-green-100 text-green-700">Completed</Badge>
                                  </div>
                                  <p className="text-sm text-neutral-600">
                                    {achievement.achievement.description}
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-1">
                                    Earned on {formatDate(achievement.dateEarned)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <h4 className="font-medium text-neutral-800">In Progress</h4>
                      
                      {achievements.filter((a: any) => !a.isCompleted).length === 0 ? (
                        <p className="text-sm text-neutral-600">No achievements in progress</p>
                      ) : (
                        achievements
                          .filter((a: any) => !a.isCompleted)
                          .map((achievement: any) => (
                            <div key={achievement.id} className="p-4 border border-neutral-200 rounded-lg">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  <Award className="h-6 w-6" />
                                </div>
                                <div className="ml-3 flex-1">
                                  <h4 className="font-medium text-neutral-800">
                                    {achievement.achievement.name}
                                  </h4>
                                  <p className="text-sm text-neutral-600">
                                    {achievement.achievement.description}
                                  </p>
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs text-neutral-600 mb-1">
                                      <span>Progress: {achievement.progress}/{achievement.achievement.thresholdValue}</span>
                                      <span>{Math.round((achievement.progress / achievement.achievement.thresholdValue) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-600 h-1.5 rounded-full" 
                                        style={{ width: `${(achievement.progress / achievement.achievement.thresholdValue) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
