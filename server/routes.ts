import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChapterRequestSchema,
  insertWorkshopSessionSchema,
  insertParticipantSchema, 
  insertUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import MemoryStore from "memorystore";
import { syncChapterRequestToSupabase, syncAllDataToSupabase } from "./supabaseSync";
import { sendChapterRequestNotification } from "./email";
import { checkDatabaseStatus } from "./statusCheck";

// Helper to handle zod validation errors
function handleZodError(err: unknown, res: Response) {
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: err.errors 
    });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ethics-workshop-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Set up passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      
      // This is a simplified password check. In a real application,
      // you would use bcrypt or a similar library to hash and compare passwords
      if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Check if a user is authenticated and an admin
  function isAdmin(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated() && (req.user as any)?.isAdmin) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  }
  
  // Authentication routes
  app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });
  
  app.post('/api/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });
  
  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ isAuthenticated: true, user: req.user });
    } else {
      res.json({ isAuthenticated: false });
    }
  });
  
  // User management routes (admin only)
  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  // Chapter Request routes
  app.get('/api/chapter-requests', isAdmin, async (req, res) => {
    const requests = await storage.getChapterRequests();
    res.json(requests);
  });
  
  app.get('/api/chapter-requests/:id', isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const request = await storage.getChapterRequestById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Chapter request not found" });
    }
    
    res.json(request);
  });
  
  app.post('/api/chapter-requests', async (req, res) => {
    try {
      const requestData = insertChapterRequestSchema.parse(req.body);
      const newRequest = await storage.createChapterRequest(requestData);
      
      // Only try to sync if Supabase is connected
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await syncChapterRequestToSupabase(newRequest);
        } catch (syncErr) {
          console.error('Error syncing to Supabase:', syncErr);
          // Continue with the response even if sync fails
        }
      }
      
      // Send email notification
      try {
        const emailSent = await sendChapterRequestNotification(newRequest);
        if (emailSent) {
          console.log('Chapter request notification email sent successfully');
        } else {
          console.warn('Failed to send chapter request notification email');
        }
      } catch (emailErr) {
        console.error('Error sending email notification:', emailErr);
        // Continue with the response even if email fails
      }
      
      res.status(201).json(newRequest);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.patch('/api/chapter-requests/:id/status', isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedRequest = await storage.updateChapterRequestStatus(id, status);
    
    if (!updatedRequest) {
      return res.status(404).json({ message: "Chapter request not found" });
    }
    
    // Only try to sync if Supabase is connected
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await syncChapterRequestToSupabase(updatedRequest);
      } catch (syncErr) {
        console.error('Error syncing updated chapter request to Supabase:', syncErr);
        // Continue with the response even if sync fails
      }
    }
    
    res.json(updatedRequest);
  });
  
  // Workshop Session routes
  app.get('/api/workshop-sessions', async (req, res) => {
    const sessions = await storage.getWorkshopSessions();
    res.json(sessions);
  });
  
  app.get('/api/workshop-sessions/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const session = await storage.getWorkshopSessionById(id);
    
    if (!session) {
      return res.status(404).json({ message: "Workshop session not found" });
    }
    
    res.json(session);
  });
  
  app.post('/api/workshop-sessions', isAdmin, async (req, res) => {
    try {
      const sessionData = insertWorkshopSessionSchema.parse(req.body);
      const newSession = await storage.createWorkshopSession(sessionData);
      res.status(201).json(newSession);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.patch('/api/workshop-sessions/:id/status', isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedSession = await storage.updateWorkshopSessionStatus(id, status);
    
    if (!updatedSession) {
      return res.status(404).json({ message: "Workshop session not found" });
    }
    
    res.json(updatedSession);
  });
  
  app.patch('/api/workshop-sessions/:id/reported', isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { reported } = req.body;
    
    if (typeof reported !== 'boolean') {
      return res.status(400).json({ message: "Invalid reported status" });
    }
    
    const updatedSession = await storage.markWorkshopSessionReported(id, reported);
    
    if (!updatedSession) {
      return res.status(404).json({ message: "Workshop session not found" });
    }
    
    res.json(updatedSession);
  });
  
  // Participant routes
  app.get('/api/participants', isAdmin, async (req, res) => {
    const participants = await storage.getParticipants();
    res.json(participants);
  });
  
  app.get('/api/participants/by-session/:sessionId', isAdmin, async (req, res) => {
    const sessionId = parseInt(req.params.sessionId);
    const participants = await storage.getParticipantsBySessionId(sessionId);
    res.json(participants);
  });
  
  app.post('/api/participants', async (req, res) => {
    try {
      const participantData = insertParticipantSchema.parse(req.body);
      
      // Verify that the session exists
      if (participantData.sessionId !== undefined) {
        const session = await storage.getWorkshopSessionById(participantData.sessionId);
        if (!session) {
          return res.status(404).json({ message: "Workshop session not found" });
        }
      } else {
        return res.status(400).json({ message: "Session ID is required" });
      }
      
      const newParticipant = await storage.createParticipant(participantData);
      res.status(201).json(newParticipant);
    } catch (err) {
      handleZodError(err, res);
    }
  });
  
  app.post('/api/participants/mark-reported', isAdmin, async (req, res) => {
    const { participantIds } = req.body;
    
    if (!Array.isArray(participantIds) || participantIds.some(id => typeof id !== 'number')) {
      return res.status(400).json({ message: "Invalid participant IDs" });
    }
    
    const count = await storage.markParticipantsReported(participantIds);
    res.json({ count });
  });
  
  // Export participants for CFP Board reporting
  app.get('/api/export/participants', isAdmin, async (req, res) => {
    const { sessionId } = req.query;
    
    let participants;
    if (sessionId) {
      participants = await storage.getParticipantsBySessionId(parseInt(sessionId as string));
    } else {
      participants = await storage.getParticipants();
    }
    
    // Convert to CSV
    const headers = ['First Name', 'Last Name', 'CFP ID', 'Email', 'Session ID', 'Attendance Confirmed', 'Reported to CFP Board', 'Created At'];
    const rows = participants.map(p => [
      p.firstName,
      p.lastName,
      p.cfpId,
      p.email,
      p.sessionId?.toString() || '',
      p.attendanceConfirmed ? 'Yes' : 'No',
      p.reportedToCfpBoard ? 'Yes' : 'No',
      p.createdAt.toISOString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=participants.csv');
    res.send(csvContent);
  });
  
  // Sync data to Supabase (no auth required)
  app.post('/api/sync/supabase', async (req, res) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ 
        success: false, 
        message: "Supabase connection is not configured"
      });
    }
    
    try {
      await syncAllDataToSupabase();
      res.json({ success: true, message: "Data successfully synced to Supabase" });
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      res.status(500).json({ success: false, message: "Failed to sync data to Supabase" });
    }
  });
  
  // Database status endpoint (admin-only)
  app.get('/api/system/db-status', isAdmin, async (req, res) => {
    try {
      const status = await checkDatabaseStatus();
      res.json(status);
    } catch (err) {
      console.error('Error checking database status:', err);
      res.status(500).json({ 
        message: "Error checking database status",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  });

  // Serve the SQL setup file
  app.get('/supabase_setup.sql', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'supabase_setup.sql');
    
    try {
      if (fs.existsSync(filePath)) {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(sqlContent);
      } else {
        res.status(404).send('SQL setup file not found');
      }
    } catch (err) {
      console.error('Error serving SQL file:', err);
      res.status(500).send('Error reading SQL file');
    }
  });

  return httpServer;
}
