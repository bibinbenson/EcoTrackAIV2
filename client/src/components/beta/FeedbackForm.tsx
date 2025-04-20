import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const feedbackSchema = z.object({
  content: z.string().min(5, "Feedback must be at least 5 characters"),
  feedbackType: z.string(),
  rating: z.coerce.number().min(1).max(5).optional(),
  pageContext: z.string().optional()
});

export function FeedbackForm({ onClose }: { onClose?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      content: "",
      feedbackType: "general",
      rating: undefined,
      pageContext: window.location.pathname
    }
  });

  const onSubmit = async (data: z.infer<typeof feedbackSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/feedback", data);
      // Update user's beta feedback status
      await apiRequest("POST", "/api/onboarding/complete", {
        hasProvidedBetaFeedback: true
      });
      // Invalidate user data to refresh UI
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve the application.",
        variant: "default"
      });
      
      // Log the activity
      await apiRequest("POST", "/api/user-activity", {
        activityType: "feedback_submitted",
        details: { 
          type: data.feedbackType,
          timestamp: new Date().toISOString()
        }
      });
      
      form.reset();
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Provide Beta Feedback</CardTitle>
        <CardDescription>
          Help us improve by sharing your experience with the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="feedbackType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="usability">Usability Issue</SelectItem>
                      <SelectItem value="performance">Performance Issue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      placeholder="Rate from 1 to 5" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    How would you rate your experience? (1 = poor, 5 = excellent)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts, suggestions, or report issues..." 
                      className="min-h-32" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input 
              type="hidden" 
              {...form.register("pageContext")} 
              value={window.location.pathname} 
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}