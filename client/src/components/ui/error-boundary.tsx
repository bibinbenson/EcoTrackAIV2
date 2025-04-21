import * as React from "react";
import { logError } from "@/lib/error-logger";

/**
 * Error boundary component for React
 * Catches errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
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
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
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

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}