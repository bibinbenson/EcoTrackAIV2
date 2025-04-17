import { Car, Home, Utensils, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
  containerClassName?: string;
  color?: string;
}

export function CategoryIcon({ 
  category, 
  size = 20, 
  className, 
  containerClassName,
  color
}: CategoryIconProps) {
  const getIcon = () => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes("transport")) {
      return <Car size={size} className={className} />;
    } else if (categoryLower.includes("hous") || categoryLower.includes("home") || categoryLower.includes("energy")) {
      return <Home size={size} className={className} />;
    } else if (categoryLower.includes("food")) {
      return <Utensils size={size} className={className} />;
    } else if (categoryLower.includes("good") || categoryLower.includes("shop")) {
      return <ShoppingBag size={size} className={className} />;
    } else {
      return <ShoppingBag size={size} className={className} />;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full", 
        containerClassName
      )}
      style={color ? { backgroundColor: `${color}10`, color } : undefined}
    >
      {getIcon()}
    </div>
  );
}
