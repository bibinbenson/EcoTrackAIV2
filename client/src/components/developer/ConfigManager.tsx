import { useState } from 'react';
import { Loader2, Save, Plus, Trash, ToggleLeft, Eye, EyeOff, RefreshCw, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

// Feature flag model
type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'all' | 'development' | 'production';
  createdAt: string;
  updatedAt: string;
};

// Environment variable model
type EnvVariable = {
  id: string;
  key: string;
  value: string;
  type: 'public' | 'secret';
  description: string;
  createdAt: string;
  updatedAt: string;
};

// For demonstration purposes
const defaultFeatureFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'enable_carbon_ai',
    description: 'Enable AI-powered carbon footprint suggestions',
    enabled: true,
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'enable_marketplace',
    description: 'Enable the carbon offset marketplace',
    enabled: true,
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'enable_supply_chain',
    description: 'Enable supply chain emissions tracking features',
    enabled: true,
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'enable_beta_features',
    description: 'Enable all beta features for testing',
    enabled: false,
    environment: 'development',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'enable_social_sharing',
    description: 'Enable social media sharing of achievements',
    enabled: false,
    environment: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// For demonstration purposes
const defaultEnvVariables: EnvVariable[] = [
  {
    id: '1',
    key: 'API_RATE_LIMIT',
    value: '100',
    type: 'public',
    description: 'Number of API requests allowed per minute',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'DATABASE_CONNECTION_LIMIT',
    value: '50',
    type: 'public',
    description: 'Maximum number of database connections',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    key: 'OPENAI_API_KEY',
    value: '••••••••••••••••••••••••••••••',
    type: 'secret',
    description: 'OpenAI API key for carbon footprint analysis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    key: 'ADMIN_EMAIL',
    value: 'admin@ecotrac.com',
    type: 'public',
    description: 'Admin contact email address',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function ConfigManager() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(defaultFeatureFlags);
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>(defaultEnvVariables);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSecretValues, setShowSecretValues] = useState<{[key: string]: boolean}>({});
  const [newFeatureName, setNewFeatureName] = useState<string>('');
  const [newFeatureDesc, setNewFeatureDesc] = useState<string>('');
  const [newEnvKey, setNewEnvKey] = useState<string>('');
  const [newEnvValue, setNewEnvValue] = useState<string>('');
  const [newEnvDesc, setNewEnvDesc] = useState<string>('');
  const [newEnvType, setNewEnvType] = useState<'public' | 'secret'>('public');
  
  // Toggle feature flag
  const toggleFeatureFlag = (id: string) => {
    setFeatureFlags(featureFlags.map(flag => {
      if (flag.id === id) {
        const updated = { 
          ...flag, 
          enabled: !flag.enabled,
          updatedAt: new Date().toISOString()
        };
        
        // In a real implementation, this would be an API request
        toast({
          title: `Feature ${updated.enabled ? 'Enabled' : 'Disabled'}`,
          description: `"${flag.name}" is now ${updated.enabled ? 'enabled' : 'disabled'}`,
        });
        
        return updated;
      }
      return flag;
    }));
  };
  
  // Add new feature flag
  const addFeatureFlag = () => {
    if (!newFeatureName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the feature flag',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate unique name
    if (featureFlags.some(flag => flag.name === newFeatureName.trim())) {
      toast({
        title: 'Name Must Be Unique',
        description: 'A feature flag with this name already exists',
        variant: 'destructive',
      });
      return;
    }
    
    const newFlag: FeatureFlag = {
      id: Date.now().toString(),
      name: newFeatureName.trim(),
      description: newFeatureDesc.trim() || 'No description provided',
      enabled: false,
      environment: 'all',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setFeatureFlags([newFlag, ...featureFlags]);
    
    // Clear form
    setNewFeatureName('');
    setNewFeatureDesc('');
    
    toast({
      title: 'Feature Flag Added',
      description: `"${newFlag.name}" has been added`,
    });
  };
  
  // Delete feature flag
  const deleteFeatureFlag = (id: string) => {
    const flagToDelete = featureFlags.find(flag => flag.id === id);
    
    setFeatureFlags(featureFlags.filter(flag => flag.id !== id));
    
    toast({
      title: 'Feature Flag Deleted',
      description: `"${flagToDelete?.name}" has been deleted`,
    });
  };
  
  // Toggle showing secret value
  const toggleShowSecret = (id: string) => {
    setShowSecretValues({
      ...showSecretValues,
      [id]: !showSecretValues[id]
    });
  };
  
  // Add new environment variable
  const addEnvVariable = () => {
    if (!newEnvKey.trim()) {
      toast({
        title: 'Key Required',
        description: 'Please enter a key for the environment variable',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate unique key
    if (envVariables.some(env => env.key === newEnvKey.trim())) {
      toast({
        title: 'Key Must Be Unique',
        description: 'An environment variable with this key already exists',
        variant: 'destructive',
      });
      return;
    }
    
    const newEnv: EnvVariable = {
      id: Date.now().toString(),
      key: newEnvKey.trim(),
      value: newEnvValue.trim(),
      type: newEnvType,
      description: newEnvDesc.trim() || 'No description provided',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setEnvVariables([newEnv, ...envVariables]);
    
    // Clear form
    setNewEnvKey('');
    setNewEnvValue('');
    setNewEnvDesc('');
    setNewEnvType('public');
    
    toast({
      title: 'Environment Variable Added',
      description: `"${newEnv.key}" has been added`,
    });
  };
  
  // Delete environment variable
  const deleteEnvVariable = (id: string) => {
    const envToDelete = envVariables.find(env => env.id === id);
    
    setEnvVariables(envVariables.filter(env => env.id !== id));
    
    toast({
      title: 'Environment Variable Deleted',
      description: `"${envToDelete?.key}" has been deleted`,
    });
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Simulate a refresh operation
  const refreshConfig = async () => {
    setIsLoading(true);
    
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Configuration Refreshed',
      description: 'Configuration has been refreshed from the server',
    });
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refreshConfig}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Configuration
        </Button>
      </div>
    
      <Tabs defaultValue="feature_flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feature_flags" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="env_variables" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Environment Variables
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feature_flags" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="new-feature-name">Name</Label>
                  <Input
                    id="new-feature-name"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="e.g., enable_new_feature"
                    className="mb-2"
                  />
                  <Label htmlFor="new-feature-desc">Description</Label>
                  <Input
                    id="new-feature-desc"
                    value={newFeatureDesc}
                    onChange={(e) => setNewFeatureDesc(e.target.value)}
                    placeholder="What does this feature flag control?"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addFeatureFlag}
                    className="w-full sm:w-auto"
                    disabled={!newFeatureName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature Flag
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px] text-center">Status</TableHead>
                  <TableHead className="w-[120px]">Environment</TableHead>
                  <TableHead className="w-[180px]">Last Updated</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-mono text-xs">
                      {flag.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {flag.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch 
                                checked={flag.enabled}
                                onCheckedChange={() => toggleFeatureFlag(flag.id)}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{flag.enabled ? 'Enabled' : 'Disabled'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {flag.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(flag.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFeatureFlag(flag.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {featureFlags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No feature flags found. Add one above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="env_variables" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="new-env-key">Key</Label>
                  <Input
                    id="new-env-key"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="e.g., API_TIMEOUT"
                    className="mb-2"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="new-env-value">Value</Label>
                      <Input
                        id="new-env-value"
                        value={newEnvValue}
                        onChange={(e) => setNewEnvValue(e.target.value)}
                        placeholder="Value"
                        type={newEnvType === 'secret' ? 'password' : 'text'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-env-type">Type</Label>
                      <div className="flex items-center h-10 space-x-2">
                        <Switch
                          id="new-env-type"
                          checked={newEnvType === 'secret'}
                          onCheckedChange={(checked) => 
                            setNewEnvType(checked ? 'secret' : 'public')
                          }
                        />
                        <Label htmlFor="new-env-type" className="cursor-pointer">
                          {newEnvType === 'secret' ? 'Secret' : 'Public'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-env-desc">Description</Label>
                  <Input
                    id="new-env-desc"
                    value={newEnvDesc}
                    onChange={(e) => setNewEnvDesc(e.target.value)}
                    placeholder="What is this environment variable for?"
                    className="mb-6"
                  />
                  
                  <Button
                    onClick={addEnvVariable}
                    className="w-full"
                    disabled={!newEnvKey.trim() || !newEnvValue.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Environment Variable
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Key</TableHead>
                  <TableHead className="w-[200px]">Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[180px]">Last Updated</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {envVariables.map((env) => (
                  <TableRow key={env.id}>
                    <TableCell className="font-mono text-xs">
                      {env.key}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        {env.type === 'secret' ? (
                          <>
                            <span>{showSecretValues[env.id] ? env.value : '••••••••••••••••••••••••••••••'}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleShowSecret(env.id)}
                              className="h-6 w-6"
                            >
                              {showSecretValues[env.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </>
                        ) : (
                          env.value
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {env.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={env.type === 'secret' ? 'destructive' : 'default'} className="capitalize">
                        {env.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(env.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEnvVariable(env.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {envVariables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No environment variables found. Add one above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}