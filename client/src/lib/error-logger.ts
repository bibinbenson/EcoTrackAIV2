/**
 * Client-side error logging utility
 * This module provides tools for logging client-side errors to the server for tracking
 */

import { apiRequest } from "./queryClient";

/**
 * Log a client-side error to the server
 * @param error The error object
 * @param url Optional URL where the error occurred
 * @param severity Error severity (low, medium, high)
 * @returns Promise resolving to the error log ID or undefined if logging failed
 */
export async function logError(
  error: Error | string,
  url?: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
): Promise<number | undefined> {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = typeof error === 'string' ? null : error.stack || null;
    
    const response = await apiRequest('POST', '/api/errors', {
      errorMessage,
      stackTrace,
      url: url || window.location.href,
      userAgent: navigator.userAgent,
      severity
    });
    
    const data = await response.json();
    return data.errorId;
  } catch (logError) {
    // Don't throw if logging fails
    console.error('Failed to log error:', logError);
    return undefined;
  }
}

/**
 * Setup global error handler to automatically log unhandled errors
 */
export function setupGlobalErrorLogging(): void {
  const originalOnError = window.onerror;
  
  window.onerror = function(message, source, lineno, colno, error) {
    // Call original handler if exists
    if (typeof originalOnError === 'function') {
      originalOnError.apply(this, arguments as any);
    }
    
    // Log error to server
    logError(
      error || String(message),
      source ? String(source) : undefined,
      'high'
    );
    
    // Don't prevent default handling
    return false;
  };

  // Also handle promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || 'Unhandled Promise Rejection';
    const errorStack = event.reason?.stack || null;
    
    apiRequest('POST', '/api/errors', {
      errorMessage,
      stackTrace: errorStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: 'high'
    }).catch(err => console.error('Failed to log unhandled rejection:', err));
  });
  
  console.info('Global error logging has been set up');
}