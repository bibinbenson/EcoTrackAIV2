import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { logError } from "./error-logger";

// Custom API Error class with additional context
export class ApiError extends Error {
  status: number;
  url: string;
  method: string;

  constructor(status: number, message: string, url: string, method: string) {
    super(`${status}: ${message}`);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.method = method;
  }
}

async function throwIfResNotOk(res: Response, method: string) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      // Try to parse response as JSON for more detailed error
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        // Fallback to text
        errorMessage = await res.text() || errorMessage;
      }
    } catch (e) {
      // Parsing failed, use status text
      console.error("Error parsing error response:", e);
    }

    const apiError = new ApiError(res.status, errorMessage, res.url, method);
    
    // Log API errors with severity based on status code
    const severity = res.status >= 500 ? 'critical' : 'error';
    logError(apiError, { severity });
    
    throw apiError;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res, method);
    return res;
  } catch (error) {
    if (error instanceof ApiError) {
      // ApiError already logged and formatted
      throw error;
    }
    
    // Handle network errors or other non-response errors
    const networkError = error as Error;
    logError(networkError, { 
      severity: 'critical',
      context: `API Request: ${method} ${url}`
    });
    
    throw new ApiError(0, networkError.message, url, method);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res, 'GET');
      return await res.json();
    } catch (error) {
      if (error instanceof ApiError) {
        // ApiError already logged and formatted
        throw error;
      }
      
      // Handle network errors or other non-response errors
      const networkError = error as Error;
      logError(networkError, { 
        severity: 'critical',
        context: `Query: ${queryKey.join('/')}`
      });
      
      throw new ApiError(0, networkError.message, queryKey[0] as string, 'GET');
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
