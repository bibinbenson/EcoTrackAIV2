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
import Analytics from "@/pages/analytics";

// Supply Chain pages
import Suppliers from "@/pages/suppliers";
import SupplierEmissions from "@/pages/supplier-emissions";
import SupplyChainRisks from "@/pages/supply-chain-risks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/learn" component={Learn} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={Marketplace} />
      <Route path="/community" component={Community} />
      <Route path="/profile" component={Profile} />
      <Route path="/goals" component={Goals} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/analytics" component={Analytics} />
      
      {/* Supply Chain Routes */}
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/supplier-emissions" component={SupplierEmissions} />
      <Route path="/supply-chain-risks" component={SupplyChainRisks} />
      
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
