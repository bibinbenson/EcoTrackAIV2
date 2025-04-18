import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Check, GiftIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EcoReward {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  pointCost: number;
  rewardType: string;
  partnerName: string | null;
  isActive: boolean;
  expiryDate: Date | null;
}

interface UserReward {
  id: number;
  userId: number;
  rewardId: number;
  dateEarned: string;
  isRedeemed: boolean;
  redeemedDate: string | null;
  redemptionCode: string | null;
  reward?: EcoReward;
}

const RewardsPage = () => {
  const { toast } = useToast();

  // Get all available rewards
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["/api/eco-rewards"],
    select: (data: EcoReward[]) => data.filter(reward => reward.isActive),
  });

  // Get user's earned rewards
  const { data: userRewards, isLoading: isLoadingUserRewards } = useQuery({
    queryKey: ["/api/user-rewards"],
  });

  // Mutation to earn a reward
  const earnRewardMutation = useMutation({
    mutationFn: (rewardId: number) => {
      return apiRequest("/api/user-rewards", {
        method: "POST",
        body: JSON.stringify({ rewardId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Reward earned!",
        description: "You have successfully earned this reward.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to earn reward",
        description: "You may not have enough points or there was an error.",
        variant: "destructive",
      });
    },
  });

  // Mutation to redeem a reward
  const redeemRewardMutation = useMutation({
    mutationFn: (userRewardId: number) => {
      return apiRequest(`/api/user-rewards/${userRewardId}/redeem`, {
        method: "PATCH",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-rewards"] });
      toast({
        title: "Reward redeemed!",
        description: `Your redemption code is: ${data.redemptionCode}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to redeem reward",
        description: "There was an error redeeming your reward.",
        variant: "destructive",
      });
    },
  });

  // Check if user already earned a specific reward
  const hasEarnedReward = (rewardId: number) => {
    return userRewards?.some((ur: UserReward) => ur.rewardId === rewardId);
  };

  // Get user data to show points
  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  if (isLoadingRewards || isLoadingUserRewards) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Eco Rewards</h1>
          <p className="text-muted-foreground mt-1">
            Earn and redeem rewards with your eco points
          </p>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Your Points</div>
          <div className="text-2xl font-bold">{user?.score || 0}</div>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="myrewards">My Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rewards?.map((reward: EcoReward) => (
              <Card key={reward.id} className="overflow-hidden">
                {reward.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{reward.name}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {reward.pointCost} points
                    </Badge>
                  </div>
                  {reward.partnerName && (
                    <CardDescription>
                      Partner: {reward.partnerName}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p>{reward.description}</p>
                  <Badge className="mt-2" variant="secondary">
                    {reward.rewardType}
                  </Badge>
                </CardContent>
                <CardFooter>
                  {hasEarnedReward(reward.id) ? (
                    <Button variant="outline" disabled className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Already Earned
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={
                        earnRewardMutation.isPending ||
                        (user?.score || 0) < reward.pointCost
                      }
                      onClick={() => earnRewardMutation.mutate(reward.id)}
                    >
                      {earnRewardMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Award className="mr-2 h-4 w-4" />
                      )}
                      Earn Reward
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}

            {rewards?.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No rewards available at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="myrewards" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRewards?.map((userReward: UserReward) => {
              // Find the reward details
              const reward = rewards?.find(
                (r: EcoReward) => r.id === userReward.rewardId
              );
              
              if (!reward) return null;
              
              return (
                <Card key={userReward.id} className="overflow-hidden">
                  {reward.imageUrl && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="w-full h-full object-cover opacity-70"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{reward.name}</CardTitle>
                      <Badge 
                        variant={userReward.isRedeemed ? "secondary" : "outline"}
                      >
                        {userReward.isRedeemed ? "Redeemed" : "Available"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Earned: {new Date(userReward.dateEarned).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{reward.description}</p>
                    
                    {userReward.isRedeemed && userReward.redemptionCode && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-md">
                        <p className="text-sm font-medium">Redemption Code:</p>
                        <p className="font-mono text-lg">{userReward.redemptionCode}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Redeemed on: {new Date(userReward.redeemedDate || "").toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {userReward.isRedeemed ? (
                      <Button variant="outline" disabled className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Redeemed
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={redeemRewardMutation.isPending}
                        onClick={() => redeemRewardMutation.mutate(userReward.id)}
                      >
                        {redeemRewardMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <GiftIcon className="mr-2 h-4 w-4" />
                        )}
                        Redeem Now
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}

            {(!userRewards || userRewards.length === 0) && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  You haven't earned any rewards yet. Start by earning some eco-points!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsPage;