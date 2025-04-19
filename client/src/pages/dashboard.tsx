import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import CarbonFootprintChart from "@/components/dashboard/CarbonFootprintChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import AchievementsPanel from "@/components/dashboard/AchievementsPanel";
import LeaderboardPanel from "@/components/dashboard/LeaderboardPanel";
import TipsPanel from "@/components/dashboard/TipsPanel";
import MarketplacePreview from "@/components/dashboard/MarketplacePreview";
import QuickActions from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      return res.json();
    }
  });

  // Fetch top users to calculate user's percentile
  const { data: topUsers } = useQuery({
    queryKey: ["/api/users/top", 100],
    queryFn: async () => {
      const res = await fetch("/api/users/top?limit=100");
      if (!res.ok) throw new Error("Failed to fetch top users");
      return res.json();
    }
  });

  // Calculate user's percentile among other users
  const getUserPercentile = () => {
    if (!topUsers || !user) return null;
    
    const userCount = topUsers.length;
    if (userCount <= 1) return 100;
    
    const userIndex = topUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex === -1) return null;
    
    // Calculate percentile (higher is better)
    return Math.round(((userCount - userIndex - 1) / (userCount - 1)) * 100);
  };

  const userPercentile = getUserPercentile();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Panel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800">
          Welcome back, {isLoadingUser ? "..." : user?.firstName}!
        </h2>
        <p className="text-neutral-600 mt-1">
          Your current carbon impact score is{" "}
          <span className="font-mono font-bold text-primary">{user?.score || "..."}</span>
          {userPercentile !== null && (
            <> - better than <span className="font-mono font-bold text-primary">{userPercentile}%</span> of users!</>
          )}
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carbon Footprint Summary */}
        <div className="col-span-2">
          <CarbonFootprintChart />
          
          <CategoryBreakdown className="mt-6" />
        </div>

        {/* Achievements Panel */}
        <div>
          <AchievementsPanel />
        </div>
      </div>

      {/* Secondary Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Leaderboard Panel */}
        <LeaderboardPanel />

        {/* Tips Panel */}
        <TipsPanel />

        {/* Marketplace Preview */}
        <MarketplacePreview />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <QuickActions />
      </div>

      {/* Offset Marketplace Preview */}
      <section className="bg-primary bg-opacity-5 py-12 mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Carbon Offset Marketplace
            </h2>
            <p className="text-neutral-800 mt-2 max-w-2xl mx-auto">
              Neutralize your unavoidable emissions by supporting verified
              environmental projects around the world.
            </p>
          </div>

          {/* Featured Offset Projects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simplified Offset List with limit */}
            <div className="col-span-3 text-center mt-8">
              <Link href="/marketplace">
                <button className="bg-white hover:bg-neutral-50 border border-primary text-primary px-6 py-3 rounded-lg font-medium transition-colors">
                  Explore All Offset Projects
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
