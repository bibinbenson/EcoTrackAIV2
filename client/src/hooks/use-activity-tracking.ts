/**
 * Activity Tracking Hook
 * 
 * This hook provides functionality for tracking user activity
 * and accessing activity data for admin dashboards
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

// Types for activity tracking
export interface UserActivityLog {
  id: number;
  createdAt: Date;
  userId: number;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ActivityFilter {
  userId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useActivityTracking() {
  const { toast } = useToast();

  // Mutation for creating activity logs
  const createActivityMutation = useMutation({
    mutationFn: async (data: {
      userId: number;
      action: string;
      details?: string;
    }) => {
      const response = await apiRequest("POST", "/api/admin/activity-logs", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to log activity");
      }
      return await response.json();
    },
    onError: (error: Error) => {
      console.error("Failed to log activity:", error);
      // Don't show toast to users as this is an internal tracking function
    }
  });

  // Query for fetching activity logs (admin only)
  const useActivityLogs = (filter?: ActivityFilter) => {
    const queryParams = new URLSearchParams();
    
    if (filter?.userId) {
      queryParams.append("userId", filter.userId.toString());
    }
    
    if (filter?.action) {
      queryParams.append("action", filter.action);
    }
    
    if (filter?.startDate) {
      queryParams.append("startDate", filter.startDate.toISOString());
    }
    
    if (filter?.endDate) {
      queryParams.append("endDate", filter.endDate.toISOString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/api/admin/activity-logs${queryString ? `?${queryString}` : ''}`;

    return useQuery<UserActivityLog[]>({
      queryKey: ['/api/admin/activity-logs', filter],
      queryFn: async () => {
        const response = await apiRequest("GET", endpoint);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch activity logs");
        }
        return await response.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Function to track user activity
  const trackActivity = (
    userId: number,
    action: string,
    details?: string
  ) => {
    createActivityMutation.mutate({
      userId,
      action,
      details
    });
  };

  return {
    trackActivity,
    useActivityLogs,
    isLogging: createActivityMutation.isPending
  };
}

// Analytics hook for admin dashboard
export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/analytics");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch analytics data");
      }
      return await response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}