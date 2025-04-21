/**
 * Error Logger Utility
 * 
 * This module handles client-side error logging and reporting to the server
 */

import { apiRequest } from "./queryClient";

interface ErrorLogPayload {
  errorMessage: string;
  url?: string;
  userId?: number | null;
  stackTrace?: string;
  userAgent?: string;
  severity?: string;
}

/**
 * Log an error to the server for admin tracking
 */
export async function logError(error: Error | string, options: {
  severity?: 'warning' | 'error' | 'critical';
  userId?: number;
} = {}): Promise<void> {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? undefined : error.stack;
    const userAgent = navigator.userAgent;
    
    const payload: ErrorLogPayload = {
      errorMessage,
      stackTrace,
      userAgent,
      url: window.location.href,
      userId: options.userId,
      severity: options.severity || 'error'
    };
    
    await apiRequest('POST', '/api/errors', payload);
    
    // Also log to console during development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorMessage, error);
    }
  } catch (loggingError) {
    // Fallback to console if the server logging fails
    console.error('Error logging failed:', loggingError);
    console.error('Original error:', error);
  }
}

/**
 * Set up global error logging for unhandled exceptions and promise rejections
 */
export function setupGlobalErrorLogging(): void {
  // Handle uncaught errors
  window.addEventListener('error', (event: ErrorEvent) => {
    logError(event.error || event.message, { severity: 'critical' });
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    logError(error, { severity: 'critical' });
  });
  
  // Log React errors (would be caught by error boundaries)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Log to the server with specific React error format
    if (args[0] && typeof args[0] === 'string' && args[0].indexOf('React') !== -1) {
      logError(`React Error: ${args.join(' ')}`, { severity: 'error' });
    }
    
    // Keep the original behavior
    originalConsoleError.apply(console, args);
  };
  
  console.info('Global error logging has been set up');
}

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  severity: 'warning' | 'error' | 'critical';
  
  constructor(message: string, severity: 'warning' | 'error' | 'critical' = 'error') {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    
    // Log the error immediately when created
    logError(this, { severity });
  }
}

/**
 * Error boundary component for React
 * Can be wrapped around components to catch and display errors
 */
export function createErrorBoundary(Component: React.ComponentType<any>) {
  return class ErrorBoundary extends React.Component<any, { hasError: boolean; error: Error | null }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logError(error, { severity: 'error' });
      console.error('Component Error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="mb-2">{this.state.error?.message || 'An unknown error occurred'}</p>
            <button
              className="px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-md"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}