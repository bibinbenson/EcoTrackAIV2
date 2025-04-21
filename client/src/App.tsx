import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

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
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import DeveloperPortal from "@/pages/developer-portal";

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
      {/* Public auth route */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/calculator" component={Calculator} />
      <ProtectedRoute path="/advanced-carbon-calculator" component={AdvancedCarbonCalculator} />
      <ProtectedRoute path="/learn" component={Learn} />
      <ProtectedRoute path="/marketplace" component={Marketplace} />
      <ProtectedRoute path="/marketplace/:id" component={Marketplace} />
      <ProtectedRoute path="/community" component={Community} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/rewards" component={Rewards} />
      <ProtectedRoute path="/achievements" component={Achievements} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/esg-trading" component={ESGTrading} />
      
      {/* Protected Supply Chain Routes */}
      <ProtectedRoute path="/suppliers" component={Suppliers} />
      <ProtectedRoute path="/supplier-emissions" component={SupplierEmissions} />
      <ProtectedRoute path="/supply-chain-risks" component={SupplyChainRisks} />
      
      {/* Protected Beta-specific Routes */}
      <ProtectedRoute path="/onboarding" component={Onboarding} />
      <ProtectedRoute path="/feedback" component={Feedback} />
      
      {/* Admin-only Routes */}
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} allowedRoles={["admin"]} />
      <ProtectedRoute path="/developer-portal" component={DeveloperPortal} allowedRoles={["admin"]} />
      
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
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              {/* Only show header and footer for authenticated routes */}
              {location !== "/auth" && <Header currentPath={location} />}
              <main className={`flex-grow ${location === "/auth" ? "p-0" : ""}`}>
                <Router />
              </main>
              {location !== "/auth" && <Footer />}
              <Toaster />
            </div>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
