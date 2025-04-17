import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OffsetProject } from "@shared/schema";

export default function MarketplacePreview() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/offset-projects"],
    queryFn: async () => {
      const res = await fetch("/api/offset-projects");
      if (!res.ok) throw new Error("Failed to fetch offset projects");
      return res.json();
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Carbon Offsets
        </CardTitle>
        <Link href="/marketplace">
          <Button variant="link" className="text-primary p-0">
            Browse All
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-neutral-200 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-32 bg-neutral-200"></div>
                <div className="p-3">
                  <div className="h-4 w-32 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 w-full bg-neutral-200 rounded mb-1"></div>
                  <div className="h-3 w-4/5 bg-neutral-200 rounded mb-2"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-3 w-16 bg-neutral-200 rounded"></div>
                    <div className="h-6 w-16 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects?.slice(0, 2).map((project: OffsetProject) => (
              <div key={project.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                <img 
                  className="w-full h-32 object-cover" 
                  src={project.imageUrl} 
                  alt={project.name} 
                />
                <div className="p-3">
                  <h4 className="text-sm font-bold text-neutral-800">{project.name}</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    {project.description.length > 100 
                      ? `${project.description.substring(0, 100)}...` 
                      : project.description
                    }
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-mono font-bold text-primary">
                      ${project.pricePerTon} / ton CO₂
                    </span>
                    <Link href={`/marketplace/${project.id}`}>
                      <Button size="sm" className="text-xs">
                        Offset Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
