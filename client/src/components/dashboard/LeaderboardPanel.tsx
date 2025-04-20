import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Users, ArrowRight } from "lucide-react";
import { User } from "@shared/schema";
import { Link } from "wouter";

export default function LeaderboardPanel() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users/top"],
    queryFn: async () => {
      const res = await fetch("/api/users/top");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    }
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch current user");
      return res.json();
    }
  });

  // Get user position in leaderboard
  const getCurrentUserPosition = () => {
    if (!users || !currentUser) return null;
    
    return users.findIndex((user: User) => user.id === currentUser.id) + 1;
  };

  const userPosition = getCurrentUserPosition();

  // Color for position badge
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return "bg-green-500"; // 1st place
      case 2: return "bg-blue-500";  // 2nd place
      case 3: return "bg-amber-500"; // 3rd place
      default: return "bg-neutral-300"; // Other positions
    }
  };

  // Function to get the appropriate icon for top positions
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-neutral-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-0 pt-5">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-neutral-800 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Community Leaders
            </CardTitle>
            <CardDescription className="text-neutral-500 mt-1">
              Top contributors reducing carbon impact
            </CardDescription>
          </div>
          <Link href="/community">
            <Button variant="ghost" className="text-primary text-sm" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="space-y-3 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center p-2 animate-pulse">
                <div className="w-7 h-7 bg-neutral-200 rounded-full flex items-center justify-center"></div>
                <div className="h-10 w-10 rounded-full bg-neutral-200 mx-3"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-16 bg-neutral-200 rounded mt-2"></div>
                </div>
                <div className="h-6 w-14 bg-neutral-200 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {users?.slice(0, 5).map((user: User, index: number) => {
              const position = index + 1;
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    isCurrentUser ? "bg-primary/5 border border-primary/20" : 
                    position <= 3 ? "hover:bg-neutral-50" : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="w-7 h-7 flex items-center justify-center">
                    {getPositionIcon(position) || (
                      <span className="text-sm font-medium text-neutral-500">#{position}</span>
                    )}
                  </div>
                  
                  <div className="relative">
                    <img 
                      className="h-10 w-10 rounded-full object-cover mx-3 border-2 border-white shadow-sm" 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName || ''}+${user.lastName || ''}&background=random`}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
                    />
                    {position <= 3 && (
                      <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${
                        position === 1 ? "bg-yellow-500" :
                        position === 2 ? "bg-neutral-300" :
                        "bg-amber-700"
                      } border-2 border-white flex items-center justify-center`}>
                        <span className="text-xs font-bold text-white">{position}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">
                      {isCurrentUser ? "You" : (user.firstName && user.lastName) ? 
                        `${user.firstName} ${user.lastName}` : 
                        user.username || "Anonymous User"}
                    </p>
                    <p className="text-xs text-neutral-500 flex items-center">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      {user.score} impact points
                    </p>
                  </div>
                  
                  <div className={`text-xs px-2.5 py-1 rounded-full ${
                    position === 1 ? "bg-yellow-100 text-yellow-800" :
                    position === 2 ? "bg-neutral-100 text-neutral-800" :
                    position === 3 ? "bg-amber-100 text-amber-800" :
                    "bg-blue-50 text-blue-800"
                  }`}>
                    {position === 1 ? "Gold" :
                     position === 2 ? "Silver" :
                     position === 3 ? "Bronze" :
                     "Participant"}
                  </div>
                </div>
              );
            })}
            
            {/* Your position if not in top 5 */}
            {userPosition && userPosition > 5 && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-neutral-500">Your Position</span>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-7 h-7 flex items-center justify-center">
                    <span className="text-sm font-medium text-neutral-500">#{userPosition}</span>
                  </div>
                  
                  <img 
                    className="h-10 w-10 rounded-full object-cover mx-3 border-2 border-white shadow-sm" 
                    src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser?.firstName || ''}+${currentUser?.lastName || ''}&background=random`}
                    alt="Your avatar"
                  />
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">You</p>
                    <p className="text-xs text-neutral-500 flex items-center">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      {currentUser?.score} impact points
                    </p>
                  </div>
                  
                  <div className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary/80">
                    Your Rank
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
