import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EducationalResource } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Video,
  BookOpen,
  ExternalLink
} from "lucide-react";

interface ResourceListProps {
  categoryId?: number;
  limit?: number;
  showTabs?: boolean;
}

export default function ResourceList({ categoryId, limit, showTabs = true }: ResourceListProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch educational resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["/api/educational-resources", categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/api/educational-resources?categoryId=${categoryId}`
        : "/api/educational-resources";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch educational resources");
      return res.json();
    }
  });
  
  // Get resource icon based on type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "guide":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Filter resources based on active tab
  const filteredResources = () => {
    if (activeTab === "all") {
      return resources;
    }
    return resources.filter((r: EducationalResource) => r.resourceType === activeTab);
  };
  
  // Get resource type counts for tabs
  const getResourceTypeCounts = () => {
    const counts: Record<string, number> = { all: resources.length };
    
    resources.forEach((r: EducationalResource) => {
      if (!counts[r.resourceType]) {
        counts[r.resourceType] = 0;
      }
      counts[r.resourceType]++;
    });
    
    return counts;
  };
  
  const typeCounts = getResourceTypeCounts();
  const displayResources = limit ? filteredResources().slice(0, limit) : filteredResources();
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-neutral-800">
          Educational Resources
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showTabs && !isLoading && resources.length > 0 && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="w-full">
              <TabsTrigger value="all">
                All ({typeCounts.all || 0})
              </TabsTrigger>
              {typeCounts.article > 0 && (
                <TabsTrigger value="article">
                  Articles ({typeCounts.article})
                </TabsTrigger>
              )}
              {typeCounts.video > 0 && (
                <TabsTrigger value="video">
                  Videos ({typeCounts.video})
                </TabsTrigger>
              )}
              {typeCounts.guide > 0 && (
                <TabsTrigger value="guide">
                  Guides ({typeCounts.guide})
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(limit || 3)].map((_, i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                  <div className="ml-3">
                    <div className="h-4 w-40 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">No educational resources available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayResources.map((resource: EducationalResource) => (
              <div 
                key={resource.id} 
                className="p-4 border border-neutral-200 hover:border-primary hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                    {getResourceIcon(resource.resourceType)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-neutral-800 mb-1">
                      {resource.title}
                    </h3>
                    
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {resource.content.length > 120 
                        ? `${resource.content.substring(0, 120)}...` 
                        : resource.content
                      }
                    </p>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-neutral-500 capitalize">
                        {resource.resourceType}
                      </span>
                      
                      {resource.externalUrl ? (
                        <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-primary">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="text-xs">View</span>
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-primary">
                          <span className="text-xs">Read More</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {limit && resources.length > limit && (
              <div className="text-center mt-4">
                <Button variant="outline" className="w-full">
                  View All Resources
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
