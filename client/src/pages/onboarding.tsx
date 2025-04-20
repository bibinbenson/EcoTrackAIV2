import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { OnboardingFlow } from "@/components/beta/OnboardingFlow";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(true);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("GET", "/api/onboarding/status");
        const { completed } = await response.json();
        
        // If onboarding is already completed, redirect to dashboard
        if (completed) {
          setOnboardingRequired(false);
          setLocation("/dashboard");
        } else {
          setOnboardingRequired(true);
          // Log that user viewed onboarding
          await apiRequest("POST", "/api/user-activity", {
            activityType: "onboarding_started",
            details: { startedAt: new Date().toISOString() }
          });
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        toast({
          title: "Error",
          description: "Failed to check onboarding status. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [setLocation, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading your onboarding experience...</p>
        </div>
      </div>
    );
  }

  if (!onboardingRequired) {
    return null; // Will redirect to dashboard in useEffect
  }

  return <OnboardingFlow />;
}