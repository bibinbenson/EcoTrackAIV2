import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import OffsetList from "@/components/marketplace/OffsetList";
import { PurchaseConfirmationDialog } from "@/components/marketplace/PurchaseConfirmationDialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Check, X, MapPin } from "lucide-react";

export default function Marketplace() {
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : undefined;
  
  // If projectId is provided, show project details
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {projectId ? (
        <ProjectDetails projectId={projectId} />
      ) : (
        <MarketplaceList />
      )}
    </div>
  );
}

function MarketplaceList() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800">
          Carbon Offset Marketplace
        </h2>
        <p className="text-neutral-600 mt-1">
          Support verified projects that reduce carbon emissions around the world
        </p>
      </div>
      
      {/* Marketplace Banner */}
      <div className="rounded-xl overflow-hidden bg-primary mb-8 relative">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Carbon offsets" 
          className="w-full h-64 object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">
          <div className="text-white p-8">
            <h2 className="text-3xl font-bold mb-2">Make a Positive Impact</h2>
            <p className="mb-4 max-w-lg">
              Every offset you purchase directly contributes to projects that reduce greenhouse gas 
              emissions and often provide additional social and environmental benefits.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-neutral-100">
              Learn How Offsets Work
            </Button>
          </div>
        </div>
      </div>
      
      {/* Project List */}
      <OffsetList />
      
      {/* Marketplace FAQ */}
      <div className="mt-12 bg-neutral-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-neutral-800 mb-6">
          Frequently Asked Questions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-neutral-800 mb-2">What are carbon offsets?</h4>
            <p className="text-sm text-neutral-600">
              Carbon offsets represent the reduction of one metric ton of carbon dioxide 
              equivalent (CO2e) that is invested in projects designed to reduce greenhouse gas emissions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-neutral-800 mb-2">How do I know these projects are legitimate?</h4>
            <p className="text-sm text-neutral-600">
              All projects on our marketplace are verified by recognized standards like Gold Standard, 
              Verified Carbon Standard, or Climate Action Reserve, ensuring their legitimacy and impact.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-neutral-800 mb-2">What's the difference between project types?</h4>
            <p className="text-sm text-neutral-600">
              Projects range from renewable energy and reforestation to methane capture and energy efficiency. 
              Each type has different benefits and costs based on their implementation and region.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-neutral-800 mb-2">How is pricing determined?</h4>
            <p className="text-sm text-neutral-600">
              Pricing varies based on project type, location, co-benefits (like biodiversity protection or 
              community development), and verification standard. Premium projects often have higher prices.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ProjectDetails({ projectId }: { projectId: number }) {
  const [offsetAmount, setOffsetAmount] = useState(1);
  const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);
  
  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/offset-projects", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/offset-projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project details");
      return res.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-neutral-200 rounded mb-4"></div>
        <div className="h-4 w-full max-w-2xl bg-neutral-200 rounded mb-8"></div>
        
        <div className="h-96 w-full bg-neutral-200 rounded-xl mb-8"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-6 w-32 bg-neutral-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-200 rounded"></div>
              <div className="h-4 w-full bg-neutral-200 rounded"></div>
              <div className="h-4 w-2/3 bg-neutral-200 rounded"></div>
            </div>
          </div>
          
          <div className="h-64 w-full bg-neutral-200 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">
          Project Not Found
        </h2>
        <p className="text-neutral-600 mb-6">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/marketplace">
          <Button>
            Return to Marketplace
          </Button>
        </Link>
      </div>
    );
  }
  
  // Calculate total cost
  const totalCost = project.pricePerTon * offsetAmount;
  
  return (
    <>
      <div className="mb-6">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Marketplace
          </Button>
        </Link>
        
        <h2 className="text-2xl font-bold text-neutral-800">
          {project.name}
        </h2>
        <div className="flex items-center text-neutral-600 mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{project.location}</span>
          {project.isVerified && (
            <Badge className="ml-2 bg-primary bg-opacity-10 text-primary">Verified</Badge>
          )}
        </div>
      </div>
      
      {/* Project Image */}
      <div className="rounded-xl overflow-hidden mb-8 h-96">
        <img 
          src={project.imageUrl} 
          alt={project.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            About This Project
          </h3>
          
          <div className="prose max-w-none mb-6">
            <p className="text-neutral-600">{project.description}</p>
          </div>
          
          <h4 className="font-bold text-neutral-800 mb-2">Project Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <div className="mt-1 h-5 w-5 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <p className="text-neutral-800">Carbon Reduction</p>
                <p className="text-sm text-neutral-600">
                  Directly reduces greenhouse gas emissions
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 h-5 w-5 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <p className="text-neutral-800">Economic Development</p>
                <p className="text-sm text-neutral-600">
                  Creates jobs and stimulates local economy
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 h-5 w-5 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <p className="text-neutral-800">Environmental Protection</p>
                <p className="text-sm text-neutral-600">
                  Preserves biodiversity and natural habitats
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 h-5 w-5 text-green-500">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-2">
                <p className="text-neutral-800">Community Support</p>
                <p className="text-sm text-neutral-600">
                  Improves quality of life for local communities
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-neutral-600 mr-2">Project Tags:</span>
            {project.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-neutral-50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Offset Purchase Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-neutral-800">
                Purchase Carbon Offsets
              </CardTitle>
              <CardDescription>
                Support this project by offsetting your carbon footprint
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Price per ton of CO₂
                </label>
                <div className="text-2xl font-mono font-bold text-primary">
                  ${project.pricePerTon.toFixed(2)}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Amount to offset (tons)
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffsetAmount(Math.max(1, offsetAmount - 1))}
                    className="rounded-r-none"
                  >
                    -
                  </Button>
                  <div className="px-4 py-2 border-y border-x-0 text-center font-mono font-bold">
                    {offsetAmount}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffsetAmount(offsetAmount + 1)}
                    className="rounded-l-none"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-neutral-800">Total Cost</span>
                <span className="text-xl font-mono font-bold text-primary">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              
              <Button 
                className="w-full" 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/offset-purchases', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        projectId: project.id,
                        amount: offsetAmount,
                        cost: totalCost
                      }),
                    });
                    
                    if (response.ok) {
                      alert('Purchase successful! You have offset ' + offsetAmount + ' tons of CO₂.');
                    } else {
                      throw new Error('Failed to complete purchase');
                    }
                  } catch (error) {
                    console.error('Purchase error:', error);
                    alert('There was a problem completing your purchase. Please try again.');
                  }
                }}
              >
                Purchase Offset
              </Button>
              
              <p className="text-xs text-neutral-500 mt-2 text-center">
                You'll receive a certificate for your offset purchase
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2 text-sm text-neutral-600 border-t pt-4">
              <div className="flex items-start">
                <div className="mt-1 h-4 w-4 text-primary">
                  <Check className="h-4 w-4" />
                </div>
                <p className="ml-2">Third-party verified project</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 h-4 w-4 text-primary">
                  <Check className="h-4 w-4" />
                </div>
                <p className="ml-2">Transparent carbon accounting</p>
              </div>
              <div className="flex items-start">
                <div className="mt-1 h-4 w-4 text-primary">
                  <Check className="h-4 w-4" />
                </div>
                <p className="ml-2">Regular project updates</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
