import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Dashboard from "@/pages/dashboard";
import Calculator from "@/pages/calculator";
import Learn from "@/pages/learn";
import Marketplace from "@/pages/marketplace";
import Community from "@/pages/community";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Goals from "@/pages/goals";
import Rewards from "@/pages/rewards";
import Achievements from "@/pages/achievements";
import Analytics from "@/pages/analytics";
import ESGTrading from "@/pages/esg-trading";
import AdvancedCarbonCalculator from "@/pages/advanced-carbon-calculator";

// Supply Chain pages
import Suppliers from "@/pages/suppliers";
import SupplierEmissions from "@/pages/supplier-emissions";
import SupplyChainRisks from "@/pages/supply-chain-risks";

// Beta-specific pages
import Onboarding from "@/pages/onboarding";
import Feedback from "@/pages/feedback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/advanced-carbon-calculator" component={AdvancedCarbonCalculator} />
      <Route path="/learn" component={Learn} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={Marketplace} />
      <Route path="/community" component={Community} />
      <Route path="/profile" component={Profile} />
      <Route path="/goals" component={Goals} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/esg-trading" component={ESGTrading} />
      
      {/* Supply Chain Routes */}
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/supplier-emissions" component={SupplierEmissions} />
      <Route path="/supply-chain-risks" component={SupplyChainRisks} />
      
      {/* Beta-specific Routes */}
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/feedback" component={Feedback} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Header currentPath={location} />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
