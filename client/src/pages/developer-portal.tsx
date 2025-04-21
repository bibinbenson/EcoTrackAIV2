import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2, ServerCrash, Activity, Database, Settings, Code, Zap, BarChart3 } from 'lucide-react';
import ApiExplorer from '@/components/developer/ApiExplorer';
import LogExplorer from '@/components/developer/LogExplorer';
import SystemHealth from '@/components/developer/SystemHealth';
import ConfigManager from '@/components/developer/ConfigManager';
import DevAnalytics from '@/components/developer/DevAnalytics';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function DeveloperPortal() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('logs');
  
  // Generate test error for debugging
  const generateTestError = () => {
    try {
      // Intentionally throw an error for testing
      throw new Error('This is a test error from the developer portal');
    } catch (err: any) {
      console.error('Test error generated:', err);
      toast({
        title: 'Test Error Generated',
        description: 'A test error has been logged to the system',
        variant: 'default',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only allow admin users to access this page
  if (!user || user.accountType !== 'admin') {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">
            Advanced tools for testing, debugging, and managing the EcoTrac platform
          </p>
        </div>
        <Button variant="outline" onClick={generateTestError}>
          Generate Test Error
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-2 max-w-4xl">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ServerCrash className="h-4 w-4" />
            <span className="hidden sm:inline">Error Logs</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">API Explorer</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">System Health</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerCrash className="h-5 w-5 text-destructive" /> 
                Error Logs Explorer
              </CardTitle>
              <CardDescription>
                View, filter, and analyze application errors and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogExplorer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" /> 
                API Explorer
              </CardTitle>
              <CardDescription>
                Test API endpoints, view documentation, and analyze API performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiExplorer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" /> 
                System Health
              </CardTitle>
              <CardDescription>
                Monitor server health, database connection, and resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemHealth />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" /> 
                Configuration Management
              </CardTitle>
              <CardDescription>
                Manage feature flags, environment variables, and system parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-500" /> 
                Developer Analytics
              </CardTitle>
              <CardDescription>
                Technical performance metrics and developer-focused analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DevAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}