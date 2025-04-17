import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Activity } from "@shared/schema";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCarbonAmount } from "@/lib/utils";

export default function ActivityLogForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user's recent activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities/recent"],
    queryFn: async () => {
      const res = await fetch("/api/activities/recent?limit=5");
      if (!res.ok) throw new Error("Failed to fetch recent activities");
      return res.json();
    }
  });
  
  // Fetch categories for display
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Delete an activity
  const deleteActivity = useMutation({
    mutationFn: async (activityId: number) => {
      return apiRequest("DELETE", `/api/activities/${activityId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Activity deleted",
        description: "The activity has been removed from your log.",
      });
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-footprint"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-by-category"] });
    },
    onError: () => {
      toast({
        title: "Failed to delete activity",
        description: "There was an error deleting the activity. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Get category details by ID
  const getCategoryById = (categoryId: number) => {
    if (!categories) return null;
    return categories.find((c: any) => c.id === categoryId);
  };
  
  // Handle delete button click
  const handleDelete = (activity: Activity) => {
    if (confirm(`Are you sure you want to delete this activity? This will reduce your carbon footprint by ${formatCarbonAmount(activity.carbonAmount)}.`)) {
      deleteActivity.mutate(activity.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-800">Recent Activities</CardTitle>
        <CardDescription>
          Your most recently logged carbon activities
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded-lg animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-neutral-200"></div>
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
          <div className="space-y-4">
            {activities.map((activity: Activity) => {
              const category = getCategoryById(activity.categoryId);
              return (
                <div key={activity.id} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <CategoryIcon
                        category={category?.name || ""}
                        size={20}
                        containerClassName="h-10 w-10"
                        color={category?.color}
                      />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-neutral-800">{activity.description}</h4>
                        <p className="text-xs text-neutral-600">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {formatCarbonAmount(activity.carbonAmount)}
                    </Badge>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => handleDelete(activity)}
                      disabled={deleteActivity.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="text-sm text-neutral-600">
          <p>Need to log a new activity? Use the calculator above.</p>
        </div>
      </CardContent>
    </Card>
  );
}
