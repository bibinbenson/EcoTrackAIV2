import { useQuery } from "@tanstack/react-query";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCarbonAmount } from "@/lib/utils";

interface CategoryBreakdownProps {
  className?: string;
}

export default function CategoryBreakdown({ className }: CategoryBreakdownProps) {
  // Fetch carbon usage by category
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["/api/carbon-by-category"],
    queryFn: async () => {
      const res = await fetch("/api/carbon-by-category");
      if (!res.ok) throw new Error("Failed to fetch category breakdown");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-4 gap-4 mt-6 ${className}`}>
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="text-center animate-pulse">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-neutral-200"></div>
            <div className="mt-1 h-4 w-16 mx-auto bg-neutral-200 rounded"></div>
            <div className="mt-1 h-3 w-10 mx-auto bg-neutral-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className={`grid grid-cols-4 gap-4 mt-6 ${className}`}>
        <div className="col-span-4 text-center text-neutral-500">
          No category data available
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className}`}>
      {categoryData.map((item: any) => (
        <div key={item.categoryId} className="text-center">
          <CategoryIcon
            category={item.category.name}
            size={20}
            containerClassName="h-10 w-10 mx-auto"
            color={item.category.color}
          />
          <p className="mt-1 text-sm font-medium text-neutral-800">{item.category.name}</p>
          <p className="text-neutral-600 font-mono text-xs">
            {formatCarbonAmount(item.totalCarbon)}
          </p>
        </div>
      ))}
    </div>
  );
}
