import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// No need for this import

export default function AdvancedCalculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activityType, setActivityType] = useState("transport");
  const [carbonEstimate, setCarbonEstimate] = useState(0);
  
  // Form state using react-hook-form
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      description: "",
      transportType: "car",
      distance: 10,
      distanceUnit: "km",
      carType: "medium",
      flightType: "domestic",
      housingType: "electricity",
      amount: 100,
      unit: "kWh",
      heatingType: "oil",
      foodType: "beef",
      goodsType: "clothing",
      quantity: 1
    }
  });
  
  // Watch for form value changes to update estimates
  const formValues = watch();
  
  // Calculate carbon estimate when relevant form values change
  useEffect(() => {
    calculateEstimate();
  }, [
    activityType,
    formValues.transportType,
    formValues.distance,
    formValues.distanceUnit,
    formValues.carType,
    formValues.flightType,
    formValues.housingType,
    formValues.amount,
    formValues.unit,
    formValues.heatingType,
    formValues.foodType,
    formValues.goodsType,
    formValues.quantity
  ]);
  
  // Submit the activity
  const submitActivity = useMutation({
    mutationFn: async (data: any) => {
      // Create the activity payload
      const categoryId = 
        activityType === "transport" ? 1 :
        activityType === "housing" ? 2 :
        activityType === "food" ? 3 : 4; // Goods
        
      const payload = {
        categoryId,
        description: data.description,
        date: new Date().toISOString(),
        carbonAmount: carbonEstimate,
        metadata: { activityType, ...data }
      };
      
      console.log("Submitting activity:", payload);
      return apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      toast({
        title: "Activity logged successfully",
        description: `You added ${carbonEstimate.toFixed(2)} kg of CO2e to your carbon footprint.`,
      });
      
      // Reset form 
      reset({
        description: "",
        transportType: "car",
        distance: 10,
        distanceUnit: "km",
        carType: "medium",
        flightType: "domestic",
        housingType: "electricity", 
        amount: 100,
        unit: "kWh",
        heatingType: "oil",
        foodType: "beef",
        goodsType: "clothing",
        quantity: 1
      });
      
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
  
  // Calculate carbon estimate based on form values
  const calculateEstimate = () => {
    let estimate = 0;
    
    try {
      switch (activityType) {
        case "transport":
          if (formValues.transportType === "car") {
            const distanceInKm = formValues.distanceUnit === "miles" 
              ? formValues.distance * 1.60934 
              : formValues.distance;
              
            const carEmissionFactor = formValues.carType === "small" ? 0.15 :
                                      formValues.carType === "medium" ? 0.19 :
                                      formValues.carType === "large" ? 0.27 :
                                      formValues.carType === "electric" ? 0.05 : 0.22;
                                      
            estimate = distanceInKm * carEmissionFactor;
          } else if (formValues.transportType === "public_transport") {
            const distanceInKm = formValues.distanceUnit === "miles" 
              ? formValues.distance * 1.60934 
              : formValues.distance;
              
            estimate = distanceInKm * 0.03; // Bus/train factor
          } else if (formValues.transportType === "flight") {
            const distanceInKm = formValues.distanceUnit === "miles" 
              ? formValues.distance * 1.60934 
              : formValues.distance;
              
            const flightFactor = formValues.flightType === "domestic" ? 0.2 :
                                formValues.flightType === "short_haul" ? 0.15 : 0.1;
                                
            estimate = distanceInKm * flightFactor;
          }
          break;
          
        case "housing":
          if (formValues.housingType === "electricity") {
            // Convert to kWh if needed
            const amountInkWh = formValues.unit === "kWh" 
              ? formValues.amount 
              : formValues.amount * 0.001; // MWh to kWh
              
            estimate = amountInkWh * 0.5; // Electricity factor
          } else if (formValues.housingType === "heating") {
            const heatingFactor = formValues.heatingType === "gas" ? 0.2 :
                                formValues.heatingType === "oil" ? 0.25 : 0.1;
                                
            estimate = formValues.amount * heatingFactor;
          } else if (formValues.housingType === "water") {
            estimate = formValues.amount * 0.001; // Water usage factor
          }
          break;
          
        case "food":
          const foodFactor = formValues.foodType === "beef" ? 27 :
                           formValues.foodType === "pork" ? 12 :
                           formValues.foodType === "chicken" ? 6 :
                           formValues.foodType === "fish" ? 5 :
                           formValues.foodType === "dairy" ? 3 :
                           formValues.foodType === "vegetables" ? 0.5 : 2;
                           
          estimate = foodFactor * (formValues.quantity || 1);
          break;
          
        case "goods":
          const goodsFactor = formValues.goodsType === "clothing" ? 15 :
                            formValues.goodsType === "electronics" ? 50 :
                            formValues.goodsType === "furniture" ? 100 :
                            formValues.goodsType === "paper" ? 3 : 8;
                            
          estimate = goodsFactor * (formValues.quantity || 1);
          break;
      }
      
      setCarbonEstimate(Math.round(estimate * 100) / 100);
    } catch (error) {
      console.error("Error calculating estimate:", error);
      setCarbonEstimate(0);
    }
  };
  
  const onSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    
    if (!data.description || data.description.length < 3) {
      toast({
        title: "Missing description",
        description: "Please provide a brief description for this activity.",
        variant: "destructive"
      });
      return;
    }
    
    if (carbonEstimate <= 0) {
      toast({
        title: "Invalid carbon amount",
        description: "Please ensure the activity generates a valid carbon amount.",
        variant: "destructive"
      });
      return;
    }
    
    submitActivity.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-800">
          Advanced Carbon Calculator
        </CardTitle>
        <CardDescription>Calculate the carbon footprint of your activities</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activityType} onValueChange={setActivityType}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="housing">Housing</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="goods">Goods</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label htmlFor="description">Activity Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your activity (e.g., 'Daily commute to work', 'Weekly grocery shopping')"
                {...register("description")}
              />
            </div>
            
            <TabsContent value="transport" className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transportType">Transport Type</Label>
                  <Select 
                    value={formValues.transportType}
                    onValueChange={v => setValue("transportType", v)}
                  >
                    <SelectTrigger id="transportType">
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="public_transport">Public Transport</SelectItem>
                      <SelectItem value="flight">Flight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="distance">Distance</Label>
                    <Input
                      id="distance"
                      type="number"
                      min="0.1"
                      step="0.1"
                      {...register("distance", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor="distanceUnit">Unit</Label>
                    <Select 
                      value={formValues.distanceUnit}
                      onValueChange={v => setValue("distanceUnit", v)}
                    >
                      <SelectTrigger id="distanceUnit">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">km</SelectItem>
                        <SelectItem value="miles">miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {formValues.transportType === "car" && (
                <div>
                  <Label htmlFor="carType">Car Type</Label>
                  <Select 
                    value={formValues.carType}
                    onValueChange={v => setValue("carType", v)}
                  >
                    <SelectTrigger id="carType">
                      <SelectValue placeholder="Select car type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (Compact/Economy)</SelectItem>
                      <SelectItem value="medium">Medium (Sedan/Hatchback)</SelectItem>
                      <SelectItem value="large">Large (SUV/Truck)</SelectItem>
                      <SelectItem value="electric">Electric Vehicle</SelectItem>
                      <SelectItem value="hybrid">Hybrid Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formValues.transportType === "flight" && (
                <div>
                  <Label htmlFor="flightType">Flight Type</Label>
                  <Select 
                    value={formValues.flightType}
                    onValueChange={v => setValue("flightType", v)}
                  >
                    <SelectTrigger id="flightType">
                      <SelectValue placeholder="Select flight type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic (less than 3 hours)</SelectItem>
                      <SelectItem value="short_haul">Short-haul (3-6 hours)</SelectItem>
                      <SelectItem value="long_haul">Long-haul (more than 6 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="housing" className="pt-2 space-y-4">
              <div>
                <Label htmlFor="housingType">Energy Type</Label>
                <Select 
                  value={formValues.housingType}
                  onValueChange={v => setValue("housingType", v)}
                >
                  <SelectTrigger id="housingType">
                    <SelectValue placeholder="Select energy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="heating">Heating</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.1"
                    step="0.1"
                    {...register("amount", { valueAsNumber: true })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={formValues.unit}
                    onValueChange={v => setValue("unit", v)}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {formValues.housingType === "electricity" && (
                        <>
                          <SelectItem value="kWh">kWh</SelectItem>
                          <SelectItem value="MWh">MWh</SelectItem>
                        </>
                      )}
                      {formValues.housingType === "heating" && (
                        <>
                          <SelectItem value="therms">Therms</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </>
                      )}
                      {formValues.housingType === "water" && (
                        <>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="gallons">Gallons</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formValues.housingType === "heating" && (
                <div>
                  <Label htmlFor="heatingType">Heating Type</Label>
                  <Select 
                    value={formValues.heatingType}
                    onValueChange={v => setValue("heatingType", v)}
                  >
                    <SelectTrigger id="heatingType">
                      <SelectValue placeholder="Select heating type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gas">Natural Gas</SelectItem>
                      <SelectItem value="oil">Oil</SelectItem>
                      <SelectItem value="propane">Propane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="food" className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="foodType">Food Type</Label>
                  <Select 
                    value={formValues.foodType}
                    onValueChange={v => setValue("foodType", v)}
                  >
                    <SelectTrigger id="foodType">
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="pork">Pork</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="processed">Processed Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.1"
                    step="0.1"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="goods" className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goodsType">Product Type</Label>
                  <Select 
                    value={formValues.goodsType}
                    onValueChange={v => setValue("goodsType", v)}
                  >
                    <SelectTrigger id="goodsType">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="plastic">Plastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    step="1"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Carbon estimate display with environmental impact indicator */}
            <div className="mt-2 rounded-md overflow-hidden">
              <div className={`p-4 ${
                carbonEstimate < 5 ? "bg-green-50 border border-green-100" : 
                carbonEstimate < 20 ? "bg-yellow-50 border border-yellow-100" : 
                "bg-red-50 border border-red-100"
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <p className={`text-sm font-medium ${
                    carbonEstimate < 5 ? "text-green-800" : 
                    carbonEstimate < 20 ? "text-yellow-800" : 
                    "text-red-800"
                  }`}>
                    Estimated Carbon Footprint:
                  </p>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    carbonEstimate < 5 ? "bg-green-200 text-green-800" : 
                    carbonEstimate < 20 ? "bg-yellow-200 text-yellow-800" : 
                    "bg-red-200 text-red-800"
                  }`}>
                    {carbonEstimate < 5 ? "Low Impact" : 
                     carbonEstimate < 20 ? "Medium Impact" : 
                     "High Impact"}
                  </div>
                </div>
                <p className={`text-2xl font-bold ${
                  carbonEstimate < 5 ? "text-green-700" : 
                  carbonEstimate < 20 ? "text-yellow-700" : 
                  "text-red-700"
                }`}>
                  {carbonEstimate.toFixed(2)} kg CO₂e
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        carbonEstimate < 5 ? "bg-green-500" : 
                        carbonEstimate < 20 ? "bg-yellow-500" : 
                        "bg-red-500"
                      }`} 
                      style={{ width: `${Math.min(100, carbonEstimate * 2)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High Impact</span>
                  </div>
                </div>
              </div>
              {carbonEstimate > 20 && (
                <div className="bg-red-100 px-4 py-2 text-sm text-red-800">
                  <strong>Tip:</strong> Consider more sustainable alternatives to reduce your carbon footprint.
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 text-white bg-primary hover:bg-primary/90 font-semibold py-3"
              disabled={submitActivity.isPending}
            >
              {submitActivity.isPending ? "Logging Activity..." : "Log This Activity"}
            </Button>
          </form>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col text-sm text-neutral-600 border-t pt-4">
        <p>
          Our carbon calculations are based on widely accepted emission factors
          and provide a good approximation of your carbon footprint.
        </p>
      </CardFooter>
    </Card>
  );
}