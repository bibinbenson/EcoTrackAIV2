import { useState } from 'react';
import { Loader2, Play, Clock, FileJson, Code, ArrowRight, Copy, Save, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

type ApiRequest = {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp?: string;
  duration?: number;
  statusCode?: number;
  response?: string;
};

type EndpointItem = {
  path: string;
  method: string;
  description: string;
  authenticated: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
};

// API endpoints documentation
const apiEndpoints: EndpointItem[] = [
  {
    path: '/api/user',
    method: 'GET',
    description: 'Get the currently authenticated user',
    authenticated: true
  },
  {
    path: '/api/users/top',
    method: 'GET',
    description: 'Get a list of top performing users',
    authenticated: false
  },
  {
    path: '/api/categories',
    method: 'GET',
    description: 'Get all activity categories',
    authenticated: false
  },
  {
    path: '/api/activities',
    method: 'GET',
    description: 'Get activities for the authenticated user',
    authenticated: true,
    params: [
      { name: 'userId', type: 'number', required: false, description: 'Filter by user ID (admin only)' },
      { name: 'categoryId', type: 'number', required: false, description: 'Filter by category ID' }
    ]
  },
  {
    path: '/api/activities',
    method: 'POST',
    description: 'Create a new activity',
    authenticated: true,
    params: [
      { name: 'categoryId', type: 'number', required: true, description: 'The category ID' },
      { name: 'description', type: 'string', required: true, description: 'Activity description' },
      { name: 'carbonImpact', type: 'number', required: true, description: 'Carbon impact value (negative for reduction)' }
    ]
  },
  {
    path: '/api/carbon-footprint',
    method: 'GET',
    description: 'Get carbon footprint statistics',
    authenticated: true
  },
  {
    path: '/api/sustainability-tips',
    method: 'GET',
    description: 'Get sustainability tips',
    authenticated: false
  },
  {
    path: '/api/achievements',
    method: 'GET',
    description: 'Get all available achievements',
    authenticated: false
  },
  {
    path: '/api/user-achievements',
    method: 'GET',
    description: 'Get achievements for the authenticated user',
    authenticated: true
  },
  {
    path: '/api/offset-projects',
    method: 'GET',
    description: 'Get available carbon offset projects',
    authenticated: false
  },
  {
    path: '/api/offset-purchases',
    method: 'GET',
    description: 'Get user\'s carbon offset purchases',
    authenticated: true
  },
  {
    path: '/api/error-logs',
    method: 'GET',
    description: 'Get error logs (admin only)',
    authenticated: true
  }
];

export default function ApiExplorer() {
  const [method, setMethod] = useState<string>('GET');
  const [endpoint, setEndpoint] = useState<string>('/api/user');
  const [headerKey, setHeaderKey] = useState<string>('');
  const [headerValue, setHeaderValue] = useState<string>('');
  const [headers, setHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json'
  });
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [savedRequests, setSavedRequests] = useState<ApiRequest[]>([]);
  const [requestName, setRequestName] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem | null>(null);
  const [requestHistory, setRequestHistory] = useState<ApiRequest[]>([]);

  // Handle adding a header
  const addHeader = () => {
    if (!headerKey.trim()) return;
    
    setHeaders({
      ...headers,
      [headerKey]: headerValue
    });
    
    setHeaderKey('');
    setHeaderValue('');
  };

  // Handle removing a header
  const removeHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };

  // Handle selecting an endpoint from the documentation
  const handleSelectEndpoint = (endpointItem: EndpointItem) => {
    setMethod(endpointItem.method);
    setEndpoint(endpointItem.path);
    setSelectedEndpoint(endpointItem);
    
    // For POST/PUT endpoints, generate a sample request body
    if (endpointItem.method === 'POST' || endpointItem.method === 'PUT') {
      if (endpointItem.params) {
        const sampleBody: Record<string, any> = {};
        endpointItem.params.forEach(param => {
          if (param.type === 'string') sampleBody[param.name] = 'sample value';
          if (param.type === 'number') sampleBody[param.name] = 0;
          if (param.type === 'boolean') sampleBody[param.name] = false;
        });
        setRequestBody(JSON.stringify(sampleBody, null, 2));
      } else {
        setRequestBody('{}');
      }
    } else {
      setRequestBody('');
    }
  };

  // Format response for display
  const formatResponse = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  // Send the API request
  const sendRequest = async () => {
    setIsLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setResponseTime(null);
    
    try {
      const startTime = performance.now();
      
      let requestOptions = {};
      if (method !== 'GET' && method !== 'HEAD') {
        let parsedBody;
        try {
          parsedBody = requestBody ? JSON.parse(requestBody) : {};
        } catch (e) {
          toast({
            title: 'Invalid JSON',
            description: 'Please make sure your request body is valid JSON',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        requestOptions = { body: parsedBody };
      }
      
      const res = await apiRequest(
        method as any, 
        endpoint, 
        requestOptions
      );
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      let responseData;
      let responseText;
      
      try {
        responseData = await res.json();
        responseText = formatResponse(responseData);
      } catch (e) {
        responseText = 'No response body or invalid JSON';
      }
      
      setResponseStatus(res.status);
      setResponse(responseText);
      setResponseTime(Math.round(duration));
      
      // Add to request history
      const historyItem: ApiRequest = {
        id: Date.now().toString(),
        name: requestName || endpoint,
        method,
        url: endpoint,
        headers,
        body: requestBody,
        timestamp: new Date().toISOString(),
        duration: Math.round(duration),
        statusCode: res.status,
        response: responseText
      };
      
      setRequestHistory([historyItem, ...requestHistory.slice(0, 9)]);
      
    } catch (err: any) {
      console.error('API request failed:', err);
      setResponseStatus(err.status || 500);
      setResponse(err.message || 'Request failed');
      
      toast({
        title: 'Request Failed',
        description: err.message || 'There was an error sending the request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save the current request for future use
  const saveRequest = () => {
    if (!requestName) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for this request',
        variant: 'default',
      });
      return;
    }
    
    const newRequest: ApiRequest = {
      id: Date.now().toString(),
      name: requestName,
      method,
      url: endpoint,
      headers,
      body: requestBody
    };
    
    setSavedRequests([...savedRequests, newRequest]);
    setRequestName('');
    
    toast({
      title: 'Request Saved',
      description: `Request "${newRequest.name}" has been saved`,
    });
  };

  // Load a saved request
  const loadRequest = (request: ApiRequest) => {
    setMethod(request.method);
    setEndpoint(request.url);
    setHeaders(request.headers);
    setRequestBody(request.body);
    
    // Find matching endpoint from documentation
    const matchedEndpoint = apiEndpoints.find(e => 
      e.path === request.url && e.method === request.method
    );
    setSelectedEndpoint(matchedEndpoint || null);
  };

  // Delete a saved request
  const deleteRequest = (id: string) => {
    setSavedRequests(savedRequests.filter(req => req.id !== id));
    
    toast({
      title: 'Request Deleted',
      description: 'The saved request has been deleted',
    });
  };

  // Copy response to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied to Clipboard',
        description: 'Content has been copied to clipboard',
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: number | null) => {
    if (!status) return 'bg-gray-500';
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-blue-500';
    if (status >= 400 && status < 500) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="request" className="space-y-4">
        <TabsList>
          <TabsTrigger value="request" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Request Builder
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            API Documentation
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Saved Requests
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="request" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Input 
                    value={endpoint} 
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="API Endpoint (e.g. /api/user)" 
                    className="w-full"
                  />
                </div>
              </div>
              
              <Accordion type="multiple" defaultValue={["headers", "body"]}>
                <AccordionItem value="headers">
                  <AccordionTrigger>Headers</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          placeholder="Header name" 
                          value={headerKey} 
                          onChange={(e) => setHeaderKey(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Header value" 
                            value={headerValue} 
                            onChange={(e) => setHeaderValue(e.target.value)}
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={addHeader}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border rounded divide-y">
                        {Object.entries(headers).map(([key, value]) => (
                          <div 
                            key={key} 
                            className="flex justify-between items-center p-2 hover:bg-muted/50"
                          >
                            <div>
                              <span className="font-medium">{key}:</span>{' '}
                              <span className="text-muted-foreground">{value}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHeader(key)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {Object.keys(headers).length === 0 && (
                          <p className="text-muted-foreground text-center py-2">
                            No headers added
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="body">
                  <AccordionTrigger>Request Body</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {headers['Content-Type'] || 'application/json'}
                          </Badge>
                          {method === 'GET' && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                              Body not used in GET requests
                            </Badge>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyToClipboard(requestBody)}
                                disabled={!requestBody}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <Textarea
                        placeholder="Request body (JSON)"
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="font-mono text-sm min-h-[200px]"
                        disabled={method === 'GET' || method === 'HEAD'}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={sendRequest} 
                  disabled={isLoading || !endpoint}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
                
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    placeholder="Save request as..."
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={saveRequest}
                    disabled={!endpoint || !requestName}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {selectedEndpoint && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedEndpoint.method} {selectedEndpoint.path}
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedEndpoint.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Authentication</h4>
                      <Badge 
                        variant="outline" 
                        className={selectedEndpoint.authenticated ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-green-100 text-green-800 border-green-300"}
                      >
                        {selectedEndpoint.authenticated ? 'Required' : 'Not Required'}
                      </Badge>
                    </div>
                    
                    {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Parameters</h4>
                        <div className="border rounded divide-y text-sm">
                          {selectedEndpoint.params.map((param, i) => (
                            <div key={i} className="p-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{param.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground text-xs mt-1">
                                {param.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {response !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(responseStatus)}>
                        {responseStatus || '---'}
                      </Badge>
                      {responseTime !== null && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {responseTime} ms
                        </Badge>
                      )}
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(response)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy response</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-muted/30 max-h-[500px] overflow-auto">
                    <pre className="font-mono text-xs whitespace-pre-wrap">{response}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documentation" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {apiEndpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={
                            endpoint.method === 'GET' ? 'bg-blue-500' :
                            endpoint.method === 'POST' ? 'bg-green-500' :
                            endpoint.method === 'PUT' ? 'bg-amber-500' :
                            endpoint.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <h3 className="font-mono text-sm">{endpoint.path}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {endpoint.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectEndpoint(endpoint)}
                    >
                      Use
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Badge 
                      variant="outline" 
                      className={endpoint.authenticated ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-green-100 text-green-800 border-green-300"}
                    >
                      {endpoint.authenticated ? 'Auth Required' : 'Public'}
                    </Badge>
                  </div>
                  
                  {endpoint.params && endpoint.params.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Parameters:</h4>
                      <div className="text-sm space-y-1">
                        {endpoint.params.map((param, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="font-mono">{param.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                                required
                              </Badge>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {param.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          {savedRequests.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <Save className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold">No Saved Requests</h3>
              <p className="text-muted-foreground">
                Save a request from the Request Builder tab to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={
                              request.method === 'GET' ? 'bg-blue-500' :
                              request.method === 'POST' ? 'bg-green-500' :
                              request.method === 'PUT' ? 'bg-amber-500' :
                              request.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                            }
                          >
                            {request.method}
                          </Badge>
                          <h3 className="font-semibold">{request.name}</h3>
                        </div>
                        <p className="font-mono text-sm">{request.url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadRequest(request)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteRequest(request.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          {requestHistory.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold">No Request History</h3>
              <p className="text-muted-foreground">
                Send a request from the Request Builder tab to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requestHistory.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            className={
                              request.method === 'GET' ? 'bg-blue-500' :
                              request.method === 'POST' ? 'bg-green-500' :
                              request.method === 'PUT' ? 'bg-amber-500' :
                              request.method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                            }
                          >
                            {request.method}
                          </Badge>
                          <h3 className="font-mono text-sm">{request.url}</h3>
                          
                          {request.statusCode && (
                            <Badge className={getStatusBadgeColor(request.statusCode)}>
                              {request.statusCode}
                            </Badge>
                          )}
                          
                          {request.duration && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {request.duration} ms
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {request.timestamp ? new Date(request.timestamp).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadRequest(request)}
                        >
                          Replay
                        </Button>
                      </div>
                    </div>
                    
                    {request.response && (
                      <div className="mt-4">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="response">
                            <AccordionTrigger>Response</AccordionTrigger>
                            <AccordionContent>
                              <pre className="font-mono text-xs whitespace-pre-wrap p-2 bg-muted/30 rounded border overflow-x-auto max-h-[200px]">
                                {request.response}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}