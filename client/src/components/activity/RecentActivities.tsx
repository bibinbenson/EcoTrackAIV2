import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
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

export default function RecentActivities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Fetch recent activities
  const { data: activities, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/activities/recent"],
    queryFn: async () => {
      const res = await fetch("/api/activities/recent");
      if (!res.ok) throw new Error("Failed to fetch recent activities");
      return res.json();
    }
  });
  
  // Delete activity mutation
  const deleteActivity = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-footprint"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-by-category"] });
      
      // Reset delete ID
      setDeleteId(null);
    },
    onError: (error) => {
      console.error("Error deleting activity:", error);
      toast({
        title: "Failed to delete activity",
        description: "There was an error deleting the activity. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get category name
  const getCategoryName = (categoryId: number) => {
    switch(categoryId) {
      case 1: return "Transport";
      case 2: return "Housing";
      case 3: return "Food";
      case 4: return "Goods";
      default: return "Other";
    }
  };
  
  // Handle activity deletion
  const handleDelete = (id: number) => {
    deleteActivity.mutate(id);
  };

  // Style class for carbon amount
  const getCarbonAmountClass = (amount: number) => {
    if (amount < 5) return "text-green-700";
    if (amount < 20) return "text-amber-700";
    return "text-red-700";
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-neutral-800">Recent Activities</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">Loading activities...</div>
        ) : isError ? (
          <div className="py-6 text-center text-destructive">
            Error loading activities. Please try refreshing.
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div 
                key={activity.id} 
                className="bg-card-foreground/5 p-4 rounded-md flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold line-clamp-1">
                    {activity.description}
                  </p>
                  <div className="flex space-x-2 text-xs text-muted-foreground">
                    <span>{getCategoryName(activity.categoryId)}</span>
                    <span>•</span>
                    <span>{formatDate(activity.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${getCarbonAmountClass(activity.carbonAmount)}`}>
                    {activity.carbonAmount.toFixed(2)} kg CO₂e
                  </span>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setDeleteId(activity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this activity? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(activity.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No recent activities found</p>
            <p className="text-sm mt-1">Log an activity to see it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}