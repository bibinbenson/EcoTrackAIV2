import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  ChevronDown, 
  LayoutDashboard,
  Calculator,
  Target,
  Award,
  Gift,
  BookOpen,
  ShoppingBag,
  Users,
  TrendingUp,
  Truck
} from "lucide-react";

// Organize navigation items into logical groups
const navGroups = [
  {
    name: "Core",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
      { href: "/calculator", label: "Calculator", icon: <Calculator className="h-4 w-4 mr-2" /> },
      { href: "/goals", label: "Goals", icon: <Target className="h-4 w-4 mr-2" /> }
    ]
  },
  {
    name: "Engagement",
    items: [
      { href: "/achievements", label: "Achievements", icon: <Award className="h-4 w-4 mr-2" /> },
      { href: "/rewards", label: "Rewards", icon: <Gift className="h-4 w-4 mr-2" /> }
    ]
  },
  {
    name: "Platform",
    items: [
      { href: "/learn", label: "Learn", icon: <BookOpen className="h-4 w-4 mr-2" /> },
      { href: "/marketplace", label: "Marketplace", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
      { href: "/community", label: "Community", icon: <Users className="h-4 w-4 mr-2" /> },
      { href: "/esg-trading", label: "ESG Trading", icon: <TrendingUp className="h-4 w-4 mr-2" /> }
    ]
  }
];

// Supply chain navigation items
const supplyChainItems = [
  { href: "/suppliers", label: "Suppliers" },
  { href: "/supplier-emissions", label: "Emissions" },
  { href: "/supply-chain-risks", label: "Risks" }
];

// Flatten all navigation items for mobile view
const allNavItems = navGroups.flatMap(group => group.items);

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const [supplyChainOpen, setSupplyChainOpen] = useState(false);
  const isSupplyChainActive = supplyChainItems.some(item => currentPath === item.href);

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard">
            <div className="flex items-center cursor-pointer">
              <svg className="h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/>
              </svg>
              <h1 className="ml-2 text-lg font-bold text-neutral-800">EcoTrack</h1>
            </div>
          </Link>
        </div>

        {/* Desktop navigation - horizontal center-aligned tabbed menu */}
        <nav className="hidden md:flex items-center justify-center max-w-3xl mx-auto overflow-x-auto">
          <div className="flex items-center space-x-1 px-1 border-b border-transparent py-1">
            {navGroups.flatMap((group, groupIndex) => [
              ...group.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors ${
                    currentPath === item.href 
                      ? "text-primary bg-primary/5 border-primary" 
                      : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                  }`}>
                    {item.label}
                  </div>
                </Link>
              )),
              // Add separator between groups (except after the last group)
              groupIndex < navGroups.length - 1 ? (
                <div key={`separator-${groupIndex}`} className="h-6 w-px bg-neutral-200 mx-1"></div>
              ) : null
            ]).filter(Boolean)}
            
            {/* Supply Chain Navigation - Desktop */}
            <div className="relative">
              {supplyChainItems.map((item, index) => (
                index === 0 && (
                  <Link key={`direct-${item.href}`} href={item.href}>
                    <div 
                      className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors ${
                        isSupplyChainActive
                          ? "text-primary bg-primary/5" 
                          : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                      }`}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      <span>Supply Chain</span>
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </Link>
                )
              ))}
              
              {/* Supply Chain Dropdown - Desktop */}
              <div 
                className="absolute left-0 mt-1 w-44 bg-white rounded-md shadow-lg py-1 z-10 border border-neutral-100"
                style={{ display: "none" }} // Hidden but kept for future improvements
              >
                {supplyChainItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`block px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer ${
                      currentPath === item.href ? "bg-primary/5 text-primary font-medium" : ""
                    }`}>
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center space-x-2">
          <Link href="/calculator">
            <Button 
              variant="default" 
              size="sm"
              className="hidden md:flex items-center text-sm h-8 rounded-full px-4"
            >
              Log Activity
            </Button>
          </Link>
          <Link href="/profile">
            <div className="h-8 w-8 rounded-full overflow-hidden cursor-pointer border-2 border-primary/10">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
              />
            </div>
          </Link>

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col pt-4 pb-4 space-y-1">
                <h3 className="font-semibold text-neutral-500 text-xs uppercase tracking-wider mb-2 px-3">
                  Navigation
                </h3>
                {allNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`px-3 py-2 rounded-md flex items-center text-sm font-medium cursor-pointer ${
                      currentPath === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-neutral-800 hover:bg-neutral-50"
                    }`}>
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                ))}
                
                {/* Supply Chain Items - Mobile */}
                {supplyChainItems.map((item, index) => (
                  index === 0 && (
                    <Link key={`mobile-${item.href}`} href={item.href}>
                      <div className={`mt-2 px-3 py-2 rounded-md flex items-center justify-between font-medium cursor-pointer ${
                        isSupplyChainActive ? "bg-primary/10 text-primary" : "text-neutral-800 hover:bg-neutral-50"
                      }`}>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>Supply Chain</span>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </Link>
                  )
                ))}
                
                <div className="mt-4 px-3">
                  <Link href="/calculator">
                    <Button variant="default" size="sm" className="w-full">
                      Log Activity
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
