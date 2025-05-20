console.log('ALL ENV:', process.env);
console.log('ENV:', process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { syncAllDataToSupabase, supabase } from "./supabaseSync";
import { checkDatabaseStatus, logDatabaseStatus } from "./statusCheck";
import cors from "cors";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow localhost:5173 in development
      if (app.get("env") === "development") {
        callback(null, ["http://localhost:5173"]);
        return;
      }
      // In production, use the VITE_DEV_SERVER_URL or restrict as needed
      if (process.env.VITE_DEV_SERVER_URL) {
        callback(null, [process.env.VITE_DEV_SERVER_URL]);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// API request logger middleware
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

// Add a status API endpoint directly before registering routes
app.get("/api/status", async (req, res) => {
  try {
    const dbStatus = await checkDatabaseStatus();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      database: dbStatus
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check status"
    });
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Only setup Vite in development mode and AFTER api routes are registered
  if (app.get("env") === "development") {
    // If client is served separately, don't setup Vite
    if (!process.env.VITE_DEV_SERVER_URL) {
      await setupVite(app, server);
    } else {
      // If VITE_DEV_SERVER_URL is set, we assume client is served separately
      // Add a catch-all route for non-API requests to redirect to client
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
          res.redirect(process.env.VITE_DEV_SERVER_URL + req.path);
        } else {
          res.status(404).json({ message: "API endpoint not found" });
        }
      });
    }
  } else {
    serveStatic(app);
  }

  // Check database status
  try {
    const dbStatus = await checkDatabaseStatus();
    logDatabaseStatus(dbStatus);
    
    // Check Supabase configuration
    if (supabase && dbStatus.supabase.available) {
      log("Supabase client initialized and connected successfully");
      
      // Attempt initial sync of all data to Supabase
      try {
        await syncAllDataToSupabase();
        log("Initial data sync to Supabase completed");
      } catch (err) {
        // Enhanced error logging
        console.error("Failed to perform initial Supabase sync:", err);
        if (err instanceof Error) {
          console.error("Error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
          });
        }
        log("Application will continue using mock data when Supabase operations fail");
      }
    } else {
      if (supabase) {
        log("Supabase client initialized but connection failed");
        if (dbStatus.supabase.error) {
          log(`Supabase error: ${dbStatus.supabase.error}`);
        }
      } else {
        console.warn("Supabase client not available. Using mock data fallback.");
        console.warn("Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables to enable Supabase integration.");
      }
      log("Application will continue using mock data fallback");
    }
  } catch (error) {
    console.error("Error checking database status:", error);
    log("Application will start with unknown database status");
  }

  // Digital Ocean App Platform expects PORT 8080
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5002;
    
  try {
    server.listen(port, () => {
      log(`Server started in ${app.get("env")} mode`);
      log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
