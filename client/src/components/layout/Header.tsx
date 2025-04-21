import { useState, useEffect, useRef } from "react";
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
  Truck,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

// Define all navigation items with icons
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, category: "Core" },
  { href: "/calculator", label: "Calculator", icon: <Calculator className="h-4 w-4" />, category: "Core" },
  { href: "/goals", label: "Goals", icon: <Target className="h-4 w-4" />, category: "Core" },
  { href: "/achievements", label: "Achievements", icon: <Award className="h-4 w-4" />, category: "Engagement" },
  { href: "/rewards", label: "Rewards", icon: <Gift className="h-4 w-4" />, category: "Engagement" },
  { href: "/learn", label: "Learn", icon: <BookOpen className="h-4 w-4" />, category: "Platform" },
  { href: "/marketplace", label: "Marketplace", icon: <ShoppingBag className="h-4 w-4" />, category: "Platform" },
  { href: "/community", label: "Community", icon: <Users className="h-4 w-4" />, category: "Platform" },
  { href: "/esg-trading", label: "ESG Trading", icon: <TrendingUp className="h-4 w-4" />, category: "Platform" },
  { href: "/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" />, category: "Data" }
];

// Supply chain navigation items
const supplyChainItems = [
  { href: "/suppliers", label: "Suppliers", icon: <Truck className="h-4 w-4" /> },
  { href: "/supplier-emissions", label: "Emissions", icon: <Truck className="h-4 w-4" /> },
  { href: "/supply-chain-risks", label: "Risks", icon: <Truck className="h-4 w-4" /> }
];

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [mobileSupplyChainOpen, setMobileSupplyChainOpen] = useState(false);
  const [navScrollPosition, setNavScrollPosition] = useState(0);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const isSupplyChainActive = supplyChainItems.some(item => currentPath === item.href);
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate if we can scroll left or right
  const canScrollLeft = navScrollPosition > 0;
  const canScrollRight = navScrollRef.current ? 
    navScrollRef.current.scrollWidth > navScrollRef.current.clientWidth + navScrollPosition : 
    false;

  // Handle scroll navigation
  const handleScrollNav = (direction: 'left' | 'right') => {
    if (!navScrollRef.current) return;
    
    const scrollAmount = 150;
    const currentScroll = navScrollRef.current.scrollLeft;
    
    if (direction === 'left') {
      navScrollRef.current.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      });
    } else {
      navScrollRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll position state when scrolling
  const handleScroll = () => {
    if (navScrollRef.current) {
      setNavScrollPosition(navScrollRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const scrollContainer = navScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard">
            <div className="flex items-center cursor-pointer">
              <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/>
              </svg>
              <h1 className="ml-1.5 text-lg font-bold text-neutral-800">EcoTrack</h1>
            </div>
          </Link>
        </div>

        {/* Desktop navigation with scroll buttons */}
        <div className="hidden md:flex items-center justify-center relative max-w-3xl mx-auto w-full">
          {/* Left scroll button - only show if can scroll left */}
          {canScrollLeft && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-0 z-10 bg-white/80 border border-neutral-100 shadow-sm" 
              onClick={() => handleScrollNav('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {/* Scrollable navigation */}
          <div 
            ref={navScrollRef}
            className="flex items-center space-x-1 px-8 border-b border-transparent py-1 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  currentPath === item.href 
                    ? "text-primary bg-primary/5" 
                    : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
                }`}>
                  <span className="mr-1.5">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
            
            {/* Supply Chain Links - Direct links instead of dropdown */}
            <Link href="/suppliers">
              <div className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                currentPath === "/suppliers" 
                  ? "text-primary bg-primary/5" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
              }`}>
                <Truck className="h-4 w-4 mr-1.5" />
                <span>Suppliers</span>
              </div>
            </Link>
            <Link href="/supplier-emissions">
              <div className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                currentPath === "/supplier-emissions" 
                  ? "text-primary bg-primary/5" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
              }`}>
                <Truck className="h-4 w-4 mr-1.5" />
                <span>Emissions</span>
              </div>
            </Link>
            <Link href="/supply-chain-risks">
              <div className={`px-3 py-1.5 rounded-md flex items-center text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
                currentPath === "/supply-chain-risks" 
                  ? "text-primary bg-primary/5" 
                  : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
              }`}>
                <Truck className="h-4 w-4 mr-1.5" />
                <span>Risks</span>
              </div>
            </Link>
          </div>
          
          {/* Right scroll button - only show if can scroll right */}
          {canScrollRight && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 z-10 bg-white/80 border border-neutral-100 shadow-sm" 
              onClick={() => handleScrollNav('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

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
          
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-8 w-8 rounded-full overflow-hidden cursor-pointer border-2 border-primary/10">
                <img
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.firstName ? 
                  `${user.firstName} ${user.lastName}` : 
                  user?.username || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              {user?.accountType === "admin" && (
                <Link href="/admin-dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive" 
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin">●</span>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="py-4">
                  <Link href="/dashboard">
                    <div className="flex items-center mb-4 px-3">
                      <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/>
                      </svg>
                      <h2 className="ml-2 text-lg font-bold text-neutral-800">EcoTrack</h2>
                    </div>
                  </Link>
                  
                  <div className="space-y-0.5">
                    {/* Group navigation by category */}
                    {['Core', 'Engagement', 'Platform', 'Data'].map(category => {
                      const categoryItems = navItems.filter(item => item.category === category);
                      if (categoryItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-3">
                          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1 px-3">
                            {category}
                          </h3>
                          {categoryItems.map(item => (
                            <Link key={item.href} href={item.href}>
                              <div className={`px-3 py-2 rounded-md flex items-center text-sm font-medium cursor-pointer ${
                                currentPath === item.href
                                  ? "bg-primary/10 text-primary"
                                  : "text-neutral-800 hover:bg-neutral-50"
                              }`}>
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                              </div>
                            </Link>
                          ))}
                        </div>
                      );
                    })}
                    
                    {/* Supply Chain Section */}
                    <div className="mb-3">
                      <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1 px-3">
                        Supply Chain
                      </h3>
                      
                      <button
                        className={`px-3 py-2 rounded-md flex items-center justify-between font-medium cursor-pointer w-full text-left border-0 bg-transparent ${
                          isSupplyChainActive ? "bg-primary/10 text-primary" : "text-neutral-800 hover:bg-neutral-50"
                        }`}
                        onClick={() => setMobileSupplyChainOpen(prev => !prev)}
                        aria-haspopup="true"
                        aria-expanded={mobileSupplyChainOpen}
                      >
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          <span>Supply Chain</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileSupplyChainOpen ? 'transform rotate-180' : ''}`} />
                      </button>
                      
                      {mobileSupplyChainOpen && (
                        <div className="ml-7 border-l border-neutral-200 pl-2 mt-1" role="menu">
                          {supplyChainItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                              <div 
                                className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                                  currentPath === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-neutral-700 hover:bg-neutral-50"
                                }`}
                                role="menuitem"
                              >
                                {item.label}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Section with Log Activity button and Logout */}
                <div className="mt-auto p-4 border-t border-neutral-200 space-y-2">
                  <Link href="/calculator">
                    <Button variant="default" className="w-full">
                      Log Activity
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin">●</span>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}