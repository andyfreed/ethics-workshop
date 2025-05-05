import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { syncAllDataToSupabase, supabase } from "./supabaseSync";
import { checkDatabaseStatus, logDatabaseStatus } from "./statusCheck";

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Check database status
  try {
    const dbStatus = await checkDatabaseStatus();
    logDatabaseStatus(dbStatus);
    
    if (dbStatus.local.available) {
      log("Local database connection successful");
    } else {
      log("WARNING: Local database connection failed. Application may not function correctly.");
    }
    
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
        log("Application will continue using local storage only");
      }
    } else {
      if (supabase) {
        log("Supabase client initialized but connection failed");
        if (dbStatus.supabase.error) {
          log(`Supabase error: ${dbStatus.supabase.error}`);
        }
      } else {
        console.warn("Supabase client not available. Data will not be synced to Supabase.");
        console.warn("Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables to enable Supabase integration.");
      }
      log("Application will continue using local database only");
    }
  } catch (error) {
    console.error("Error checking database status:", error);
    log("Application will start with unknown database status");
  }

  // Determine port - use environment variable for production, default to 5000 for development
  // Digital Ocean App Platform expects PORT 8080
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server started in ${app.get("env")} mode`);
    log(`Listening on http://0.0.0.0:${port}`);
  });
})();
