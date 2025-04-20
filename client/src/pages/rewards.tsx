import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  Gift, 
  Loader2, 
  Search,
  ShoppingBag,
  Tag,
  Ticket,
  Trophy
} from "lucide-react";

export default function RewardsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Query user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  // Query rewards
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["/api/eco-rewards"],
  });

  // Query user rewards
  const { data: userRewards, isLoading: isLoadingUserRewards } = useQuery({
    queryKey: ["/api/user-rewards"],
  });

  // Mutation for redeeming rewards
  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: number) => {
      return apiRequest(`/api/user-rewards`, {
        method: "POST",
        data: { rewardId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${selectedReward.name}.`,
        variant: "default"
      });
      
      setRedeemDialogOpen(false);
      setConfirmDialogOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to redeem reward",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }
  });

  // Filter rewards based on search
  const filteredRewards = rewards?.filter((reward: any) => {
    if (!filter) return true;
    
    return (
      reward.name.toLowerCase().includes(filter.toLowerCase()) ||
      reward.description.toLowerCase().includes(filter.toLowerCase()) ||
      reward.partnerName?.toLowerCase().includes(filter.toLowerCase())
    );
  });

  // Check if user already has a specific reward
  const hasReward = (rewardId: number) => {
    return userRewards?.some((ur: any) => ur.rewardId === rewardId && !ur.isRedeemed);
  };

  // Format expiry date
  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle reward redemption
  const handleRedeemReward = (reward: any) => {
    setSelectedReward(reward);
    setRedeemDialogOpen(true);
  };

  // Confirm redemption
  const confirmRedemption = () => {
    if (selectedReward) {
      redeemRewardMutation.mutate(selectedReward.id);
    }
  };

  // Loading state
  if (isLoadingUser || isLoadingRewards || isLoadingUserRewards) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Gift className="h-8 w-8 mr-2 text-primary" />
            Eco Rewards
          </h1>
          <p className="text-muted-foreground mt-1">
            Redeem your eco-points for sustainable rewards and discounts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-primary/5 p-2 rounded-lg flex items-center mr-2">
            <Trophy className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold text-primary">{user?.score || 0} Points</span>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-gray-500" />
            <Input
              placeholder="Search rewards..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 w-full md:w-auto max-w-[250px]"
            />
          </div>
        </div>
      </div>

      {/* User's Rewards */}
      {userRewards?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Ticket className="h-5 w-5 mr-2 text-primary" />
            Your Rewards
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRewards.map((userReward: any) => {
              const reward = rewards?.find((r: any) => r.id === userReward.rewardId);
              if (!reward) return null;
              
              return (
                <Card key={userReward.id} className={`border-primary/20 ${userReward.isRedeemed ? 'opacity-70' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      {userReward.isRedeemed ? (
                        <Badge variant="outline" className="bg-gray-100">Redeemed</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                      )}
                    </div>
                    <CardDescription>{reward.partnerName || 'EcoTrack'}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {userReward.isRedeemed ? 
                          `Redeemed on ${new Date(userReward.redeemedAt).toLocaleDateString()}` : 
                          `Earned on ${new Date(userReward.earnedAt).toLocaleDateString()}`
                        }
                      </div>
                      {!userReward.isRedeemed && (
                        <div className="flex items-center mt-1">
                          <Tag className="h-4 w-4 mr-1" />
                          Code: <span className="font-mono ml-1">{userReward.redemptionCode}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {!userReward.isRedeemed && (
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" className="w-full">
                            Mark as Used
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Mark reward as used?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this reward as used? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                // Implementation for marking as used would go here
                                toast({
                                  title: "Reward marked as used",
                                  description: "Your reward has been marked as used."
                                });
                              }}
                            >
                              Mark as Used
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Rewards */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
          Available Rewards
        </h2>
        
        {filteredRewards?.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No rewards matching your criteria found.</p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRewards?.map((reward: any) => {
            const alreadyOwned = hasReward(reward.id);
            const canAfford = (user?.score || 0) >= reward.pointCost;
            
            return (
              <Card key={reward.id} className={`border-primary/20 ${!reward.isActive ? 'opacity-70' : ''}`}>
                {reward.imageUrl && (
                  <div className="h-40 w-full overflow-hidden rounded-t-lg">
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    {!reward.isActive ? (
                      <Badge variant="outline" className="bg-gray-100">Unavailable</Badge>
                    ) : alreadyOwned ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">Owned</Badge>
                    ) : null}
                  </div>
                  <CardDescription>{reward.partnerName || 'EcoTrack'}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-primary font-semibold">{reward.pointCost} points</span>
                    </div>
                    {reward.expiryDate && (
                      <div className="text-xs text-gray-500">
                        Expires: {formatExpiryDate(reward.expiryDate)}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant={canAfford ? "default" : "outline"} 
                    className="w-full"
                    disabled={!reward.isActive || alreadyOwned || !canAfford}
                    onClick={() => handleRedeemReward(reward)}
                  >
                    {alreadyOwned ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Redeemed
                      </>
                    ) : !canAfford ? (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        {reward.pointCost - (user?.score || 0)} more points needed
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Redeem Reward
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward? This will deduct {selectedReward?.pointCost} points from your balance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedReward.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                  
                  <div className="mt-2 flex items-center text-sm">
                    <Trophy className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium">{selectedReward.pointCost} points</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/5 rounded-md">
                <div className="text-sm flex justify-between mb-1">
                  <span>Current balance:</span>
                  <span className="font-medium">{user?.score || 0} points</span>
                </div>
                <div className="text-sm flex justify-between mb-1">
                  <span>Cost:</span>
                  <span className="font-medium text-primary">{selectedReward.pointCost} points</span>
                </div>
                <div className="text-sm flex justify-between pt-1 border-t">
                  <span>New balance:</span>
                  <span className="font-medium">{(user?.score || 0) - selectedReward.pointCost} points</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRedemption} disabled={redeemRewardMutation.isPending}>
              {redeemRewardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Confirm Redemption"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Reward Redeemed!
            </DialogTitle>
            <DialogDescription>
              Your reward has been added to your account and is ready to use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 bg-green-50 rounded-md p-4 my-4">
            <p className="text-green-800 font-medium">Your redemption code:</p>
            <div className="font-mono text-lg font-semibold mt-1 text-center p-2 bg-white rounded-md border border-green-200">
              {/* This is a generated code for display purposes - in real life this would be returned from the API */}
              ECO-{Math.random().toString(36).substring(2, 8).toUpperCase()}
            </div>
            <p className="text-xs text-green-700 mt-2">
              You can always access this code from your "Your Rewards" section.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}