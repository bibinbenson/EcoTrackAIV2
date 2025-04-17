import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Leaderboard
        </CardTitle>
        <Button variant="link" className="text-primary p-0">
          See All
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-8 text-center">
                  <div className="h-6 w-6 mx-auto bg-neutral-200 rounded-full"></div>
                </div>
                <div className="h-8 w-8 rounded-full bg-neutral-200 ml-2"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-16 bg-neutral-200 rounded mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users?.map((user: User, index: number) => {
              const position = index + 1;
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center ${
                    isCurrentUser ? "bg-primary bg-opacity-5 p-2 rounded-lg" : ""
                  }`}
                >
                  <div className={`font-mono font-bold text-lg w-8 ${
                    position === 1 ? "text-primary" :
                    position === 2 ? "text-secondary" :
                    position === 3 ? "text-amber-500" :
                    "text-neutral-600"
                  }`}>
                    {position}
                  </div>
                  
                  <img 
                    className="h-8 w-8 rounded-full" 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} 
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  
                  <div className="ml-3 flex-grow">
                    <p className="text-sm font-medium text-neutral-800">
                      {isCurrentUser ? "You" : `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-neutral-600">{user.score} points</p>
                  </div>
                  
                  <div 
                    className={`h-2.5 w-2.5 rounded-full ${getPositionColor(position)}`}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
