import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function SimpleActivityForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("1");
  const [carbonAmount, setCarbonAmount] = useState<string>("1");
  
  // Fetch categories for dropdown
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });
  
  // Submit the activity
  const submitActivity = useMutation({
    mutationFn: async () => {
      // Create the activity payload
      const payload = {
        categoryId: parseInt(categoryId),
        description,
        date: new Date().toISOString(),
        carbonAmount: parseFloat(carbonAmount),
        metadata: { simple: true }
      };
      
      console.log("Submitting activity:", payload);
      return apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      toast({
        title: "Activity logged successfully",
        description: `You added ${carbonAmount} kg of CO2e to your carbon footprint.`,
      });
      
      // Reset form
      setDescription("");
      setCarbonAmount("1");
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-footprint"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-by-category"] });
    },
    onError: (error) => {
      console.error("Error submitting activity:", error);
      toast({
        title: "Failed to log activity",
        description: "There was an error saving your activity. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.length < 3) {
      toast({
        title: "Missing description",
        description: "Please provide a brief description for this activity.",
        variant: "destructive"
      });
      return;
    }
    
    submitActivity.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-800">
          Quick Carbon Activity Logger
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Activity Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your activity (e.g., 'Commuting to work', 'Electricity usage')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={categoryId}
              onValueChange={setCategoryId}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="1">Loading...</SelectItem>
                ) : (
                  categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="carbonAmount">Carbon Amount (kg CO2e)</Label>
            <Input
              id="carbonAmount"
              type="number"
              min="0.1"
              step="0.1"
              value={carbonAmount}
              onChange={(e) => setCarbonAmount(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full mt-6 text-white bg-primary hover:bg-primary/90 font-semibold py-3"
            disabled={submitActivity.isPending}
          >
            {submitActivity.isPending ? "Logging Activity..." : "Log This Activity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}