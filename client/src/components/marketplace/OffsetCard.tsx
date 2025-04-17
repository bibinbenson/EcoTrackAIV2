import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OffsetProject } from "@shared/schema";

interface OffsetCardProps {
  project: OffsetProject;
  compact?: boolean;
}

export default function OffsetCard({ project, compact = false }: OffsetCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative w-full h-48">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="object-cover w-full h-full"
        />
        {project.isVerified && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-primary bg-opacity-10 text-primary"
          >
            Verified
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-neutral-800">{project.name}</h3>
        </div>
        <p className="text-sm text-neutral-600">{project.location}</p>
      </CardHeader>
      
      <CardContent className="flex-grow p-4 pt-0">
        {!compact && (
          <p className="text-sm text-neutral-700 mt-2 line-clamp-3">
            {project.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          {project.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-neutral-50">
              {tag}
            </Badge>
          ))}
          {project.tags.length > (compact ? 2 : 3) && (
            <Badge variant="outline" className="text-xs bg-neutral-50">
              +{project.tags.length - (compact ? 2 : 3)}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="w-full flex justify-between items-center">
          <div>
            <span className="text-xs text-neutral-600">From</span>
            <span className="block text-lg font-mono font-bold text-primary">
              ${project.pricePerTon}/ton
            </span>
          </div>
          
          <Link href={`/marketplace/${project.id}`}>
            <Button size={compact ? "sm" : "default"}>
              View Project
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
