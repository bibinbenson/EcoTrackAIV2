import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  calculateCarEmissions, 
  calculatePublicTransportEmissions,
  calculateFlightEmissions,
  calculateElectricityEmissions,
  calculateFoodEmissions,
  calculateNaturalGasEmissions
} from "@/lib/carbon-calculations";

// Define schemas for different activity types
const transportSchema = z.object({
  categoryId: z.number(),
  description: z.string().min(3, "Please provide a description"),
  transportType: z.enum(["car", "bus", "train", "plane", "bicycle", "walking"]),
  distance: z.number().min(0.1, "Distance must be greater than 0"),
  distanceUnit: z.enum(["km", "miles"]),
  carType: z.enum(["small", "medium", "large", "electric"]).optional(),
  flightType: z.enum(["domestic", "shortHaul", "longHaul"]).optional(),
});

const housingSchema = z.object({
  categoryId: z.number(),
  description: z.string().min(3, "Please provide a description"),
  housingType: z.enum(["electricity", "naturalGas", "heating", "water", "waste"]),
  amount: z.number().min(0.1, "Amount must be greater than 0"),
  unit: z.enum(["kWh", "m3", "liters", "kg"]),
  heatingType: z.enum(["oil", "wood"]).optional(),
});

const foodSchema = z.object({
  categoryId: z.number(),
  description: z.string().min(3, "Please provide a description"),
  foodType: z.enum([
    "beef", "lamb", "pork", "chicken", "fish", "eggs", 
    "milk", "cheese", "rice", "pasta", "vegetables", 
    "fruits", "legumes", "nuts", "tofu", "bread"
  ]),
  amount: z.number().min(0.1, "Amount must be greater than 0"),
  unit: z.enum(["kg", "g"]),
});

const goodsSchema = z.object({
  categoryId: z.number(),
  description: z.string().min(3, "Please provide a description"),
  goodsType: z.enum(["clothing", "electronics", "furniture", "paper", "plastic"]),
  subType: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

// Define activity type mapping
const activityTypes = [
  { value: "transport", label: "Transportation" },
  { value: "housing", label: "Housing & Energy" },
  { value: "food", label: "Food & Diet" },
  { value: "goods", label: "Goods & Services" }
];

export default function CarbonCalculator() {
  const [activityType, setActivityType] = useState("transport");
  const [carbonEstimate, setCarbonEstimate] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Create a form for the selected activity type
  const form = useForm({
    resolver: zodResolver(
      activityType === "transport" ? transportSchema :
      activityType === "housing" ? housingSchema :
      activityType === "food" ? foodSchema :
      goodsSchema
    ),
    defaultValues: {
      description: "",
      transportType: "car",
      distance: 0,
      distanceUnit: "km",
      carType: "medium",
      flightType: "domestic",
      housingType: "electricity",
      amount: 0,
      unit: "kWh",
      heatingType: "oil",
      foodType: "beef",
      goodsType: "clothing",
      subType: "",
      quantity: 1
    }
  });
  
  // Get the current values from the form
  const formValues = form.watch();
  
  // Calculate carbon estimate based on form values
  const calculateEstimate = () => {
    try {
      let estimate = 0;
      
      if (activityType === "transport") {
        const { transportType, distance, distanceUnit, carType, flightType } = formValues;
        const distanceInKm = distanceUnit === "miles" ? distance * 1.60934 : distance;
        
        if (transportType === "car" && carType) {
          estimate = calculateCarEmissions(
            distanceInKm, 
            carType as 'small' | 'medium' | 'large' | 'electric'
          );
        } else if (transportType === "bus" || transportType === "train") {
          estimate = calculatePublicTransportEmissions(
            distanceInKm, 
            transportType as 'bus' | 'train'
          );
        } else if (transportType === "plane" && flightType) {
          estimate = calculateFlightEmissions(
            distanceInKm, 
            flightType as 'domestic' | 'shortHaul' | 'longHaul'
          );
        } else if (transportType === "bicycle" || transportType === "walking") {
          estimate = 0;
        }
      } else if (activityType === "housing") {
        const { housingType, amount, unit, heatingType } = formValues;
        
        if (housingType === "electricity") {
          estimate = calculateElectricityEmissions(amount);
        } else if (housingType === "naturalGas") {
          // Convert m3 to kWh if needed
          const kWh = unit === "m3" ? amount * 10.55 : amount;
          estimate = calculateNaturalGasEmissions(kWh);
        }
      } else if (activityType === "food") {
        const { foodType, amount, unit } = formValues;
        // Convert grams to kg if needed
        const amountInKg = unit === "g" ? amount / 1000 : amount;
        
        // @ts-ignore - we know this is valid
        estimate = calculateFoodEmissions(amountInKg, foodType);
      } else if (activityType === "goods") {
        // Simple estimation for goods
        const { goodsType, quantity } = formValues;
        
        if (goodsType === "clothing") {
          estimate = 15 * quantity; // Average clothing item
        } else if (goodsType === "electronics") {
          estimate = 100 * quantity; // Average electronic device
        } else if (goodsType === "furniture") {
          estimate = 80 * quantity; // Average furniture piece
        } else {
          estimate = 5 * quantity; // Other goods
        }
      }
      
      setCarbonEstimate(estimate);
    } catch (error) {
      console.error("Error calculating estimate:", error);
    }
  };
  
  // Update estimate when form values change
  useEffect(() => {
    if (form.formState.isValid) {
      calculateEstimate();
    }
  }, [formValues, activityType]);
  
  // Reset form when activity type changes
  useEffect(() => {
    form.reset({
      description: "",
      transportType: "car",
      distance: 0,
      distanceUnit: "km",
      carType: "medium",
      flightType: "domestic",
      housingType: "electricity",
      amount: 0,
      unit: "kWh",
      heatingType: "oil",
      foodType: "beef",
      goodsType: "clothing",
      subType: "",
      quantity: 1
    });
    setCarbonEstimate(null);
  }, [activityType, form]);

  // Find the category ID based on activity type
  const getCategoryId = () => {
    if (!categories) return 1;
    
    let categoryName = "";
    if (activityType === "transport") categoryName = "Transport";
    else if (activityType === "housing") categoryName = "Housing";
    else if (activityType === "food") categoryName = "Food";
    else categoryName = "Goods";
    
    const category = categories.find((c: any) => c.name === categoryName);
    return category ? category.id : 1;
  };
  
  // Submit the activity
  const submitActivity = useMutation({
    mutationFn: async (data: any) => {
      // Create the activity payload
      const payload = {
        categoryId: getCategoryId(),
        description: data.description,
        date: new Date().toISOString(),
        carbonAmount: carbonEstimate || 0,
        metadata: { ...data }
      };
      
      return apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      toast({
        title: "Activity logged successfully",
        description: `You added ${carbonEstimate?.toFixed(2)} kg of CO2e to your carbon footprint.`,
      });
      
      // Reset form
      form.reset();
      setCarbonEstimate(null);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-footprint"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carbon-by-category"] });
    },
    onError: () => {
      toast({
        title: "Failed to log activity",
        description: "There was an error saving your activity. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    if (carbonEstimate === null) {
      toast({
        title: "Cannot submit activity",
        description: "Please complete the form to get a carbon estimate first.",
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
          Carbon Footprint Calculator
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Activity Type
          </label>
          <Select 
            value={activityType}
            onValueChange={setActivityType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1 block">
                Description
              </label>
              <Textarea
                {...form.register("description")}
                placeholder="Briefly describe this activity"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            
            {/* Transport fields */}
            {activityType === "transport" && (
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    Transport Type
                  </label>
                  <Select 
                    defaultValue={form.getValues("transportType")}
                    onValueChange={val => form.setValue("transportType", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="plane">Plane</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="walking">Walking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {form.watch("transportType") === "car" && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Car Type
                    </label>
                    <Select 
                      defaultValue={form.getValues("carType")}
                      onValueChange={val => form.setValue("carType", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select car type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small Car</SelectItem>
                        <SelectItem value="medium">Medium Car</SelectItem>
                        <SelectItem value="large">Large Car / SUV</SelectItem>
                        <SelectItem value="electric">Electric Vehicle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {form.watch("transportType") === "plane" && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Flight Type
                    </label>
                    <Select 
                      defaultValue={form.getValues("flightType")}
                      onValueChange={val => form.setValue("flightType", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select flight type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic">Domestic</SelectItem>
                        <SelectItem value="shortHaul">Short Haul (&lt; 3 hours)</SelectItem>
                        <SelectItem value="longHaul">Long Haul (&gt; 3 hours)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Distance
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register("distance", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Unit
                    </label>
                    <Select 
                      defaultValue={form.getValues("distanceUnit")}
                      onValueChange={val => form.setValue("distanceUnit", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">Kilometers</SelectItem>
                        <SelectItem value="miles">Miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            
            {/* Housing fields */}
            {activityType === "housing" && (
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    Energy Type
                  </label>
                  <Select 
                    defaultValue={form.getValues("housingType")}
                    onValueChange={val => form.setValue("housingType", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="naturalGas">Natural Gas</SelectItem>
                      <SelectItem value="heating">Heating</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {form.watch("housingType") === "heating" && (
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Heating Type
                    </label>
                    <Select 
                      defaultValue={form.getValues("heatingType")}
                      onValueChange={val => form.setValue("heatingType", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select heating type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil">Oil</SelectItem>
                        <SelectItem value="wood">Wood</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Amount
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Unit
                    </label>
                    <Select 
                      defaultValue={form.getValues("unit")}
                      onValueChange={val => form.setValue("unit", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kWh">kWh</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            
            {/* Food fields */}
            {activityType === "food" && (
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    Food Type
                  </label>
                  <Select 
                    defaultValue={form.getValues("foodType")}
                    onValueChange={val => form.setValue("foodType", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select food type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="lamb">Lamb</SelectItem>
                      <SelectItem value="pork">Pork</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="eggs">Eggs</SelectItem>
                      <SelectItem value="milk">Milk</SelectItem>
                      <SelectItem value="cheese">Cheese</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="pasta">Pasta</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="legumes">Legumes</SelectItem>
                      <SelectItem value="nuts">Nuts</SelectItem>
                      <SelectItem value="tofu">Tofu</SelectItem>
                      <SelectItem value="bread">Bread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Amount
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-neutral-700 mb-1 block">
                      Unit
                    </label>
                    <Select 
                      defaultValue={form.getValues("unit")}
                      onValueChange={val => form.setValue("unit", val as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="g">Grams</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            
            {/* Goods fields */}
            {activityType === "goods" && (
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    Goods Type
                  </label>
                  <Select 
                    defaultValue={form.getValues("goodsType")}
                    onValueChange={val => form.setValue("goodsType", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goods type" />
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
                  <label className="text-sm font-medium text-neutral-700 mb-1 block">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                </div>
              </>
            )}
            
            {carbonEstimate !== null && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-green-800 font-medium">Estimated carbon footprint:</p>
                <p className="text-2xl font-bold text-green-700">{carbonEstimate.toFixed(2)} kg CO₂e</p>
              </div>
            )}
            
            <Button 
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || submitActivity.isPending}
            >
              {submitActivity.isPending ? "Logging Activity..." : "Log This Activity"}
            </Button>
          </form>
        </Form>
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
