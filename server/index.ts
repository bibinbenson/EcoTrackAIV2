import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Fix import to use the correct function name
import { seedData } from "./seeders/index";
// Import method implementations for DatabaseStorage
import "./achievementMethods";
import "./betaMethods";
import { extendDatabaseStorage } from "./developerStorageExtender";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // First perform database migrations
  const { migrateDatabase } = await import('./db');
  try {
    console.log("Starting database migration...");
    await migrateDatabase();
    console.log("Database migration completed successfully");
  } catch (error) {
    console.error("Error during database migration:", error);
    // Don't exit, just log the error and continue
  }
  
  // Initialize default data in the database - achieve and rewards seeding 
  const { seedData } = await import('./seeders/index');
  await seedData();
  
  const server = await registerRoutes(app);

  // Global error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Get status code from error object or default to 500
    const status = err.status || err.statusCode || 500;
    
    // Get message from error object or default to generic message
    const message = err.message || "Internal Server Error";
    
    // Get error type for better error categorization
    const errorType = err.name || "UnknownError";
    
    // Log detailed error information for debugging
    console.error(`[ERROR] ${req.method} ${req.path} - ${status} ${errorType}: ${message}`);
    if (err.stack) {
      console.error(err.stack);
    }
    
    // Prepare response with consistent error format
    const errorResponse = {
      status: "error",
      message: message,
      errorType: app.get("env") === "development" ? errorType : undefined,
      // Include stack trace only in development environment
      stack: app.get("env") === "development" ? err.stack : undefined
    };
    
    // Send error response to client
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
