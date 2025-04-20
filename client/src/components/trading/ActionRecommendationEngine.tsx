import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ESGActionCard from './ESGActionCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Filter, BarChart, RefreshCw } from 'lucide-react';

// Mock data for ESG actions (in a real app, this would come from the API)
const esgActions = [
  {
    id: 1,
    title: "Solar Panel Installation",
    description: "Install solar panels to reduce energy costs and carbon footprint while potentially earning through feed-in tariffs.",
    impact: "high",
    category: "Renewable Energy",
    roi: "12-20%",
    carbonReduction: 3500,
    difficulty: "moderate",
    details: {
      steps: [
        "Get quotes from certified solar installers",
        "Check for available government subsidies or tax incentives",
        "Assess roof orientation and capacity",
        "Install solar panels and inverter",
        "Connect to grid or battery storage"
      ],
      benefits: [
        "Reduced electricity bills",
        "Carbon footprint reduction",
        "Potential income from feed-in tariffs",
        "Increased property value",
        "Energy independence"
      ],
      metrics: {
        averageCost: "$10,000-$20,000",
        paybackPeriod: "5-8 years",
        lifespan: "25+ years"
      }
    }
  },
  {
    id: 2,
    title: "Energy-Efficient Appliance Upgrade",
    description: "Replace old appliances with energy-efficient models to reduce electricity consumption and lower carbon emissions.",
    impact: "medium",
    category: "Energy Efficiency",
    roi: "10-15%",
    carbonReduction: 750,
    difficulty: "easy",
    details: {
      steps: [
        "Identify appliances with low energy efficiency ratings",
        "Research Energy Star certified replacements",
        "Calculate potential energy savings and payback period",
        "Purchase and install new appliances",
        "Properly recycle old appliances"
      ],
      benefits: [
        "Lower energy bills",
        "Reduced carbon emissions",
        "Improved appliance performance",
        "Less maintenance requirements",
        "Potential rebates or tax incentives"
      ],
      metrics: {
        averageCost: "$1,500-$5,000",
        paybackPeriod: "2-4 years",
        lifespan: "10-15 years"
      }
    }
  },
  {
    id: 3,
    title: "Green Fleet Transition",
    description: "Convert your company vehicles to electric or hybrid models to reduce fuel costs and emissions.",
    impact: "high",
    category: "Transportation",
    roi: "8-15%",
    carbonReduction: 5000,
    difficulty: "challenging",
    details: {
      steps: [
        "Conduct fleet assessment to identify vehicles for replacement",
        "Research EV/hybrid models that meet operational requirements",
        "Calculate TCO (Total Cost of Ownership) and ROI",
        "Install charging infrastructure if needed",
        "Train drivers on optimal EV/hybrid vehicle operation"
      ],
      benefits: [
        "Reduced fuel costs",
        "Lower maintenance expenses",
        "Significant carbon footprint reduction",
        "Improved corporate sustainability image",
        "Potential tax incentives and rebates"
      ],
      metrics: {
        averageCost: "$30,000-$50,000 per vehicle",
        paybackPeriod: "4-7 years",
        lifespan: "8-12 years"
      }
    }
  },
  {
    id: 4,
    title: "Rainwater Harvesting System",
    description: "Install a rainwater collection system to reduce water consumption and costs for landscaping or non-potable uses.",
    impact: "medium",
    category: "Water Conservation",
    roi: "5-10%",
    carbonReduction: 250,
    difficulty: "moderate",
    details: {
      steps: [
        "Determine collection area and potential water yield",
        "Design system including collection, filtration, and storage",
        "Check local regulations and permit requirements",
        "Install collection system, gutters, and storage tanks",
        "Connect to irrigation or greywater systems"
      ],
      benefits: [
        "Reduced water bills",
        "Lower municipal water usage",
        "Decreased stormwater runoff",
        "Improved landscape irrigation during restrictions",
        "Potential LEED certification points"
      ],
      metrics: {
        averageCost: "$2,000-$8,000",
        paybackPeriod: "5-10 years",
        lifespan: "20+ years"
      }
    }
  },
  {
    id: 5,
    title: "Insulation Upgrade",
    description: "Improve building insulation to reduce heating and cooling costs while increasing comfort and reducing emissions.",
    impact: "high",
    category: "Energy Efficiency",
    roi: "15-25%",
    carbonReduction: 1800,
    difficulty: "moderate",
    details: {
      steps: [
        "Conduct energy audit to identify insulation gaps",
        "Choose appropriate insulation materials for your climate",
        "Hire professional installers or prepare for DIY",
        "Insulate attic, walls, floors, and/or crawl spaces",
        "Seal air leaks around windows, doors, and ducts"
      ],
      benefits: [
        "Reduced heating and cooling costs",
        "Improved indoor comfort",
        "Lower carbon emissions",
        "Reduced outside noise",
        "Potential tax credits or rebates"
      ],
      metrics: {
        averageCost: "$2,000-$10,000",
        paybackPeriod: "3-5 years",
        lifespan: "20-30 years"
      }
    }
  },
  {
    id: 6,
    title: "Smart Building Management System",
    description: "Implement automated controls for HVAC, lighting, and other systems to optimize energy use based on occupancy and needs.",
    impact: "high",
    category: "Smart Technology",
    roi: "20-30%",
    carbonReduction: 2200,
    difficulty: "challenging",
    details: {
      steps: [
        "Assess current building systems and integration opportunities",
        "Select compatible smart management technology",
        "Install sensors, controls, and central management software",
        "Configure automation rules and schedules",
        "Train facility managers on system operation"
      ],
      benefits: [
        "Significant energy savings",
        "Optimized occupant comfort",
        "Reduced maintenance costs through predictive analytics",
        "Detailed usage data for further optimization",
        "Enhanced property value"
      ],
      metrics: {
        averageCost: "$5,000-$50,000 (depending on building size)",
        paybackPeriod: "2-5 years",
        lifespan: "10-15 years"
      }
    }
  },
  {
    id: 7,
    title: "LED Lighting Retrofit",
    description: "Replace traditional lighting with LED technology to reduce energy consumption and maintenance costs.",
    impact: "medium",
    category: "Energy Efficiency",
    roi: "30-50%",
    carbonReduction: 800,
    difficulty: "easy",
    details: {
      steps: [
        "Inventory current lighting fixtures and usage patterns",
        "Select appropriate LED replacements for each application",
        "Calculate energy savings and ROI",
        "Install new LED fixtures or bulbs",
        "Properly recycle old lighting components"
      ],
      benefits: [
        "Dramatic reduction in lighting energy use (70-90%)",
        "Much longer bulb life (reducing replacement costs)",
        "Improved lighting quality and control options",
        "Reduced cooling costs due to less heat generation",
        "Immediate energy savings upon installation"
      ],
      metrics: {
        averageCost: "$1,000-$10,000",
        paybackPeriod: "1-3 years",
        lifespan: "15-25 years or 50,000+ hours"
      }
    }
  },
  {
    id: 8,
    title: "Sustainable Supply Chain Program",
    description: "Develop and implement a program to assess and improve environmental performance of suppliers and logistics.",
    impact: "high",
    category: "Supply Chain",
    roi: "5-15%",
    carbonReduction: 10000,
    difficulty: "challenging",
    details: {
      steps: [
        "Map complete supply chain and identify key impact areas",
        "Develop supplier environmental assessment criteria",
        "Create incentives for suppliers to improve performance",
        "Optimize logistics for reduced emissions",
        "Implement tracking and reporting system"
      ],
      benefits: [
        "Reduced Scope 3 emissions (often the largest portion)",
        "Lower supply chain risks",
        "Enhanced brand reputation",
        "Potential cost savings through efficiency",
        "Improved supplier relationships and collaboration"
      ],
      metrics: {
        averageCost: "$50,000-$250,000 (program development)",
        paybackPeriod: "3-7 years",
        lifespan: "Ongoing with continuous improvement"
      }
    }
  }
];

// Define types
interface ESGAction {
  id: number;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  category: string;
  roi?: string;
  carbonReduction: number;
  difficulty: "easy" | "moderate" | "challenging";
  details: {
    steps: string[];
    benefits: string[];
    metrics: {
      averageCost: string;
      paybackPeriod: string;
      lifespan: string;
    }
  }
}

export default function ActionRecommendationEngine() {
  const [filter, setFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState<ESGAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch user data to personalize recommendations
  const { data: userData } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
  });
  
  // Fetch carbon footprint data to inform recommendations
  const { data: carbonData } = useQuery({
    queryKey: ['/api/carbon-by-category'],
    queryFn: async () => {
      const response = await fetch('/api/carbon-by-category');
      if (!response.ok) {
        throw new Error('Failed to fetch carbon data');
      }
      return response.json();
    },
  });
  
  // Filter actions based on selected filter and search query
  const filteredActions = esgActions.filter(action => {
    // Apply category filter
    if (filter !== 'all' && action.category.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery && !action.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !action.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !action.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort actions (could use more complex logic based on user data)
  const sortedActions = [...filteredActions].sort((a, b) => {
    // Sort by impact first (high to low)
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const impactDiff = 
      impactOrder[b.impact as keyof typeof impactOrder] - 
      impactOrder[a.impact as keyof typeof impactOrder];
    
    if (impactDiff !== 0) return impactDiff;
    
    // Then by carbon reduction (high to low)
    return b.carbonReduction - a.carbonReduction;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="flex-1" onValueChange={setFilter}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Energy Efficiency">Energy</TabsTrigger>
            <TabsTrigger value="Water Conservation">Water</TabsTrigger>
            <TabsTrigger value="Transportation">Transport</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedActions.map(action => (
          <ESGActionCard 
            key={action.id}
            title={action.title}
            description={action.description}
            impact={action.impact}
            category={action.category}
            roi={action.roi}
            carbonReduction={action.carbonReduction}
            difficulty={action.difficulty}
            onClick={() => {
              setSelectedAction(action);
              setIsDialogOpen(true);
            }}
          />
        ))}
      </div>
      
      {filteredActions.length === 0 && (
        <div className="text-center py-10 text-neutral-500">
          <p>No actions found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      )}
      
      {selectedAction && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAction.title}</DialogTitle>
              <DialogDescription>
                {selectedAction.category} • {selectedAction.impact.charAt(0).toUpperCase() + selectedAction.impact.slice(1)} Impact
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center justify-center">
                <div className="flex items-center text-primary mb-1">
                  <BarChart className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">ROI</span>
                </div>
                <span className="text-lg font-bold">{selectedAction.roi}</span>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center justify-center">
                <div className="flex items-center text-green-600 mb-1">
                  <Leaf className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Carbon Savings</span>
                </div>
                <span className="text-lg font-bold">{selectedAction.carbonReduction} kg CO₂/year</span>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center justify-center">
                <div className="flex items-center text-blue-600 mb-1">
                  <Calculator className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">Payback Period</span>
                </div>
                <span className="text-lg font-bold">{selectedAction.details.metrics.paybackPeriod}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-neutral-700">{selectedAction.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Implementation Steps</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  {selectedAction.details.steps.map((step, index) => (
                    <li key={index} className="text-neutral-700">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Key Benefits</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedAction.details.benefits.map((benefit, index) => (
                    <li key={index} className="text-neutral-700">{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Financial Details</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Average Cost</p>
                    <p className="font-semibold">{selectedAction.details.metrics.averageCost}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Payback Period</p>
                    <p className="font-semibold">{selectedAction.details.metrics.paybackPeriod}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Expected Lifespan</p>
                    <p className="font-semibold">{selectedAction.details.metrics.lifespan}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
              <Button>Add to Action Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}