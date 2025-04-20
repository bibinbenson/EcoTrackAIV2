import { FeedbackForm } from "@/components/beta/FeedbackForm";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function FeedbackPage() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Beta Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Your feedback is crucial to help us improve the application. Thank you for participating in our beta program!
        </p>
      </div>
      
      <div className="mt-8">
        <FeedbackForm onClose={() => setLocation("/dashboard")} />
      </div>
    </div>
  );
}