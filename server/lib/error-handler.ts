import { Request, Response, NextFunction } from 'express';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  
  constructor(message: string, statusCode: number, errorCode: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// Common API errors
export const NotFoundError = (message: string = 'Resource not found') => 
  new ApiError(message, 404, 'RESOURCE_NOT_FOUND');

export const BadRequestError = (message: string = 'Invalid request parameters') => 
  new ApiError(message, 400, 'BAD_REQUEST');

export const UnauthorizedError = (message: string = 'Authentication required') => 
  new ApiError(message, 401, 'UNAUTHORIZED');

export const ForbiddenError = (message: string = 'Access denied') => 
  new ApiError(message, 403, 'FORBIDDEN');

export const ValidationError = (message: string = 'Validation failed') => 
  new ApiError(message, 422, 'VALIDATION_ERROR');

export const ServerError = (message: string = 'Internal server error') => 
  new ApiError(message, 500, 'SERVER_ERROR');

// Function to handle API errors consistently
export function handleApiError(err: Error | ApiError, req: Request, res: Response) {
  console.error(`[API ERROR] ${req.method} ${req.path}:`, err);
  
  // Set default values
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let errorCode = 'SERVER_ERROR';
  
  // Extract error details if it's an ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorCode = err.errorCode;
  } else {
    // For standard errors, just use the message if available
    errorMessage = err.message || errorMessage;
  }
  
  // Send error response
  return res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    code: errorCode,
    // Include stack trace in development but not production
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

// Higher-order function to wrap async route handlers with error handling
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      handleApiError(error as Error, req, res);
    }
  };
}