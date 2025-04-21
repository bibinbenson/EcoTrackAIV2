import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SustainabilityTip } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function TipsPanel() {
  const { toast } = useToast();
  const { data: tips, isLoading } = useQuery({
    queryKey: ["/api/sustainability-tips"],
    queryFn: async () => {
      const res = await fetch("/api/sustainability-tips");
      if (!res.ok) throw new Error("Failed to fetch sustainability tips");
      return res.json();
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    }
  });

  // Find category for a tip
  const getCategoryForTip = (tip: SustainabilityTip) => {
    if (!categories) return null;
    return categories.find((cat: any) => cat.id === tip.categoryId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Sustainability Tips
        </CardTitle>
        <Button variant="link" className="text-primary p-0">
          More Tips
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-neutral-50 rounded-lg animate-pulse">
                <div className="h-4 w-16 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-neutral-200 rounded mb-1"></div>
                <div className="h-3 w-4/5 bg-neutral-200 rounded mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-12 bg-neutral-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tips?.slice(0, 3).map((tip: SustainabilityTip) => {
              const category = getCategoryForTip(tip);
              const bgColor = category ? `${category.color}10` : 'bg-primary-50';
              const textColor = category ? category.color : 'text-primary';
              
              return (
                <div 
                  key={tip.id} 
                  className={`p-3 rounded-lg`}
                  style={{ backgroundColor: bgColor }}
                >
                  <h4 
                    className={`text-sm font-bold`}
                    style={{ color: textColor }}
                  >
                    {tip.title}
                  </h4>
                  <p className="text-sm text-neutral-800 mt-1">{tip.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-neutral-600">
                      Potential impact: <span className="font-mono">-{tip.potentialImpact}kg CO₂/month</span>
                    </span>
                    <Button 
                      variant="link" 
                      className="text-sm font-medium p-0 h-auto"
                      style={{ color: textColor }}
                      onClick={() => {
                        toast({
                          title: "Tip Applied",
                          description: `You've applied "${tip.title}" to your sustainability goals.`,
                          variant: "default",
                        });
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
