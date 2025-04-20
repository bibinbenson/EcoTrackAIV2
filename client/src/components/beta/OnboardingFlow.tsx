import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckIcon, 
  ArrowRightIcon, 
  InfoIcon, 
  SettingsIcon, 
  MapIcon 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const steps: OnboardingStep[] = [
    {
      title: "Welcome to the Beta!",
      description: "Thank you for participating in our beta program. You'll be helping us improve our carbon footprint tracking application and make a real difference.",
      icon: <InfoIcon className="h-6 w-6" />
    },
    {
      title: "Explore the Dashboard",
      description: "Start by exploring your dashboard. You'll see your carbon footprint, recent activities, and achievements all in one place.",
      icon: <MapIcon className="h-6 w-6" />
    },
    {
      title: "Track Your First Activity",
      description: "Try logging your first carbon activity to see how the tracking works. You can add activities like commuting, energy usage, or food consumption.",
      icon: <CheckIcon className="h-6 w-6" />
    },
    {
      title: "Configure Your Profile",
      description: "Set up your user profile with your preferences to get personalized insights and recommendations.",
      icon: <SettingsIcon className="h-6 w-6" />
    }
  ];
  
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/onboarding/complete");
      toast({
        title: "Onboarding Complete",
        description: "Welcome to the beta program! Your account is now fully set up.",
        variant: "default"
      });
      // Log that user completed onboarding
      await apiRequest("POST", "/api/user-activity", {
        activityType: "onboarding_complete",
        details: { completedAt: new Date().toISOString() }
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem completing your onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      // Log step completion
      try {
        await apiRequest("POST", "/api/user-activity", {
          activityType: "onboarding_step",
          details: { step: currentStep + 1, completedAt: new Date().toISOString() }
        });
      } catch (error) {
        console.error("Failed to log step completion:", error);
      }
      
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };
  
  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/dashboard")}
            disabled={loading}
          >
            Skip
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={loading}
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Complete"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}