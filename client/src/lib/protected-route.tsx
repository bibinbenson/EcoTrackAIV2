import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: string[];
}

export function ProtectedRoute({ 
  path, 
  component: Component, 
  allowedRoles 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check if this route requires specific roles
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(user.accountType)) {
            // Show access denied toast
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this area.",
              variant: "destructive",
            });
            
            // Redirect to dashboard
            return <Redirect to="/" />;
          }
        }

        return <Component />;
      }}
    </Route>
  );
}