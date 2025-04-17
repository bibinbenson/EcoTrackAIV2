import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OffsetProject } from "@shared/schema";
import OffsetCard from "./OffsetCard";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface OffsetListProps {
  compact?: boolean;
  limit?: number;
}

type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc";

export default function OffsetList({ compact = false, limit }: OffsetListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectType, setProjectType] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  
  // Fetch all offset projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/offset-projects"],
    queryFn: async () => {
      const res = await fetch("/api/offset-projects");
      if (!res.ok) throw new Error("Failed to fetch offset projects");
      return res.json();
    }
  });
  
  // Extract unique project types for filter
  const getProjectTypes = () => {
    if (!projects) return [];
    const types = new Set(projects.map((p: OffsetProject) => p.projectType));
    return Array.from(types);
  };
  
  // Filter and sort projects
  const filteredProjects = () => {
    if (!projects) return [];
    
    let filtered = [...projects];
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p: OffsetProject) => 
          p.name.toLowerCase().includes(search) || 
          p.description.toLowerCase().includes(search) ||
          p.location.toLowerCase().includes(search) ||
          p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Apply project type filter
    if (projectType) {
      filtered = filtered.filter((p: OffsetProject) => p.projectType === projectType);
    }
    
    // Apply sorting
    filtered.sort((a: OffsetProject, b: OffsetProject) => {
      switch (sortBy) {
        case "price-asc":
          return a.pricePerTon - b.pricePerTon;
        case "price-desc":
          return b.pricePerTon - a.pricePerTon;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    // Apply limit if specified
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setProjectType("");
    setSortBy("price-asc");
  };
  
  // Check if any filters are applied
  const hasFilters = searchTerm !== "" || projectType !== "";

  return (
    <div>
      {!compact && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2 sm:w-auto">
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    <span>{projectType || "Project Type"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {getProjectTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <span>Sort By</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasFilters && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-neutral-600">
                {filteredProjects().length} {filteredProjects().length === 1 ? "project" : "projects"} found
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit || 3)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-lg bg-neutral-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects().length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-lg">
          <p className="text-neutral-600 font-medium">No offset projects found</p>
          {hasFilters && (
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Clear filters and try again
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects().map((project: OffsetProject) => (
            <OffsetCard 
              key={project.id} 
              project={project} 
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
