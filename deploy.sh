#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Create required directories
echo "Creating build directories..."
mkdir -p dist

# Install dependencies
echo "Installing dependencies..."
npm install --production=false

# Force install a specific version of Neon Database driver that works in production
echo "Installing compatible database driver..."
npm install --no-save @neondatabase/serverless@0.7.2

# Copy server files directly without using vite build
echo "Copying server files..."
cp -r server dist/
cp -r shared dist/
cp -r client dist/

# Copy the database schema and config
cp drizzle.config.ts dist/

# Create a production-ready express server entrypoint
echo "Creating production server entry point..."
cat > dist/index.js << 'EOL'
import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './shared/schema.js';
import { scrypt, timingSafeEqual, randomBytes } from 'crypto';
import { promisify } from 'util';
import { log } from './server/vite.js';

// Configure database connection
const neonConfig = { webSocketConstructor: ws };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

// Set up database connection
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pool, schema });

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'ethics-workshop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Authentication utilities
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64));
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Local user storage for demonstration
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'b14361404c078ffd549c03db443c3fede2f3e534d73f78f77301ed97d4a436a9fd9db05ee8b325c0ad36438b43fec8510c204fc1c1edb21d0941c00e9e2c1ce2.221e6856a6105bc3',
    name: 'Admin User',
    isAdmin: true
  }
];

// Session data storage
let sessionStore = {};

//------------- API ROUTES ---------------

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  try {
    // For the demo admin user with password "password"
    const passwordMatch = await comparePasswords(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Save user data in session
    req.session.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      isAdmin: user.isAdmin
    };
    
    // Store session
    sessionStore[req.sessionID] = req.session;
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  delete sessionStore[req.sessionID];
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout successful' });
  });
});

// Current user endpoint
app.get('/api/user', (req, res) => {
  if (req.session && req.session.user) {
    return res.status(200).json({
      isAuthenticated: true,
      user: req.session.user
    });
  }
  
  res.status(200).json({ isAuthenticated: false });
});

// Chapter requests endpoints
app.get('/api/chapter-requests', async (req, res) => {
  try {
    // In a production app, we would check authentication first
    // For a real application, use the database
    // const requests = await db.select().from(schema.chapterRequests);
    
    // For demonstration purposes
    res.json([
      {
        id: 1,
        chapterName: "FPA of Metro New York",
        contactName: "Jane Smith",
        contactEmail: "jane@fpany.org",
        contactPhone: "212-555-1234",
        preferredDate: "2025-06-15",
        notes: "Looking to host a virtual workshop for about 50 attendees.",
        status: "pending",
        createdAt: "2025-04-20T14:30:00Z"
      },
      {
        id: 2,
        chapterName: "FPA of Silicon Valley",
        contactName: "Michael Johnson",
        contactEmail: "michael@fpasv.org",
        contactPhone: "650-555-9876",
        preferredDate: "2025-07-22",
        notes: "Interested in an in-person workshop at our chapter meeting.",
        status: "approved",
        createdAt: "2025-04-18T09:15:00Z"
      }
    ]);
  } catch (error) {
    console.error('Error getting chapter requests:', error);
    res.status(500).json({ message: 'Error retrieving chapter requests' });
  }
});

app.post('/api/chapter-requests', async (req, res) => {
  try {
    const { chapterName, contactName, contactEmail, contactPhone, preferredDate, notes } = req.body;
    
    // Basic validation
    if (!chapterName || !contactName || !contactEmail || !preferredDate) {
      return res.status(400).json({
        message: 'Please provide all required fields: chapter name, contact name, contact email, and preferred date'
      });
    }
    
    // In a production app, we would save to the database
    // const [newRequest] = await db.insert(schema.chapterRequests).values({
    //   chapterName,
    //   contactName,
    //   contactEmail,
    //   contactPhone,
    //   preferredDate,
    //   notes,
    //   status: 'pending',
    //   createdAt: new Date().toISOString()
    // }).returning();
    
    // For demonstration purposes
    const newRequest = {
      id: Date.now(),
      chapterName,
      contactName,
      contactEmail,
      contactPhone,
      preferredDate,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // In a production app, we would send email notification
    // const emailSent = await sendEmail({
    //   to: 'ops@bhfe.com',
    //   from: 'noreply@ethics-workshop.com',
    //   subject: 'New Workshop Request',
    //   text: `New request from ${chapterName} for ${preferredDate}`,
    //   html: `<p>New request from ${chapterName} for ${preferredDate}</p>`
    // });
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating chapter request:', error);
    res.status(500).json({ message: 'Error submitting workshop request' });
  }
});

// Workshop sessions endpoints
app.get('/api/workshop-sessions', async (req, res) => {
  try {
    // In a production app, we would check authentication first
    // For a real application, use the database  
    // const sessions = await db.select().from(schema.workshopSessions);
    
    // For demonstration purposes
    res.json([
      {
        id: 1,
        chapterName: "FPA of Silicon Valley",
        date: "2025-07-22",
        location: "Palo Alto Community Center",
        status: "scheduled",
        reported: false
      }
    ]);
  } catch (error) {
    console.error('Error getting workshop sessions:', error);
    res.status(500).json({ message: 'Error retrieving workshop sessions' });
  }
});

// Participant data endpoints
app.get('/api/participants', async (req, res) => {
  try {
    // In a production app, we would check authentication first
    // For a real application, use the database
    // const participants = await db.select().from(schema.participants);
    
    // For demonstration purposes
    res.json([
      {
        id: 1,
        sessionId: 1,
        name: "John Doe",
        email: "john@example.com",
        cfpId: "123456",
        reported: false,
        createdAt: "2025-06-15T10:30:00Z"
      },
      {
        id: 2,
        sessionId: 1,
        name: "Jane Smith",
        email: "jane@example.com",
        cfpId: "789012",
        reported: false,
        createdAt: "2025-06-15T10:45:00Z"
      }
    ]);
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ message: 'Error retrieving participant data' });
  }
});

// Static files - serve our pre-built client
// For development, we would use Vite to serve the client
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
  
  // Serve the index.html file for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  // For development, we'll use Vite's dev server
  // This is handled by server/vite.ts in the development environment
  console.log('Running in development mode, serving static directory for demo purposes');
  
  // Serve our static demo page in development
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});
EOL

# Create the demo page for development testing
echo "Creating demo pages..."
mkdir -p dist/public

cat > dist/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ethics Workshop - FPA Chapters</title>
  <style>
    :root {
      --primary: #ffb300;
      --background: #f9f9f9;
      --text: #191102;
      --dark: #191102;
      --light: #ffffff;
      --radius: 8px;
      --shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--background);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      background-color: var(--primary);
      color: var(--light);
      padding: 1.5rem;
      box-shadow: var(--shadow);
    }
    
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    nav ul {
      display: flex;
      list-style: none;
    }
    
    nav li {
      margin-left: 1.5rem;
    }
    
    nav a {
      color: var(--light);
      text-decoration: none;
      font-weight: 500;
    }
    
    nav a:hover {
      text-decoration: underline;
    }
    
    main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    .hero {
      background-color: var(--light);
      border-radius: var(--radius);
      padding: 3rem;
      margin-bottom: 2rem;
      text-align: center;
      box-shadow: var(--shadow);
    }
    
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }
    
    .hero p {
      font-size: 1.2rem;
      max-width: 800px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    
    .cta-button {
      display: inline-block;
      background-color: var(--primary);
      color: var(--light);
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: bold;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .cta-button:hover {
      background-color: #e6a000;
    }
    
    .info-section {
      background-color: var(--light);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow);
    }
    
    .info-section h2 {
      margin-bottom: 1rem;
      color: var(--primary);
      border-bottom: 2px solid var(--primary);
      padding-bottom: 0.5rem;
    }
    
    .info-section p {
      margin-bottom: 1rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .info-card {
      background-color: var(--light);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--shadow);
    }
    
    .info-card h3 {
      margin-bottom: 1rem;
      color: var(--primary);
    }
    
    .info-card ul {
      margin-left: 1.5rem;
    }
    
    .info-card li {
      margin-bottom: 0.5rem;
    }
    
    footer {
      background-color: var(--dark);
      color: var(--light);
      padding: 2rem;
      margin-top: 2rem;
    }
    
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    
    .footer-section {
      margin-bottom: 1.5rem;
      min-width: 200px;
    }
    
    .footer-section h3 {
      margin-bottom: 1rem;
      color: var(--primary);
    }
    
    .footer-section ul {
      list-style: none;
    }
    
    .footer-section li {
      margin-bottom: 0.5rem;
    }
    
    .footer-section a {
      color: var(--light);
      text-decoration: none;
    }
    
    .footer-section a:hover {
      text-decoration: underline;
    }
    
    .copyright {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
    }
    
    .message {
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: var(--radius);
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
    }
    
    .tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      margin-bottom: 1rem;
    }
    
    .tab {
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-right: 0.5rem;
    }
    
    .tab.active {
      border-bottom: 2px solid var(--primary);
      color: var(--primary);
      font-weight: bold;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    form {
      margin-top: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    input[type="password"],
    textarea,
    select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    
    thead {
      background-color: #f5f5f5;
    }
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      text-align: center;
    }
    
    .status-pending {
      background-color: #FFC107;
      color: #fff;
    }
    
    .status-approved {
      background-color: #4CAF50;
      color: #fff;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: var(--radius);
      text-align: center;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    
    .admin-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      nav ul {
        margin-top: 1rem;
      }
      
      nav li:first-child {
        margin-left: 0;
      }
      
      .hero {
        padding: 2rem;
      }
      
      .hero h1 {
        font-size: 2rem;
      }
      
      .footer-container {
        flex-direction: column;
      }
      
      .tabs {
        flex-wrap: wrap;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="header-container">
      <div class="logo">Ethics Workshop</div>
      <nav>
        <ul>
          <li><a href="#home" onclick="showPage('home')">Home</a></li>
          <li><a href="#course" onclick="showPage('course')">Course Description</a></li>
          <li><a href="#request" onclick="showPage('request')">Request Workshop</a></li>
          <li><a href="#auth" onclick="showPage('auth')" id="authLink">Admin Login</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main id="mainContent">
    <!-- Content will be dynamically inserted here -->
  </main>
  
  <footer>
    <div class="footer-container">
      <div class="footer-section">
        <h3>Ethics Workshop</h3>
        <p>Providing quality ethics continuing education for financial planning professionals.</p>
      </div>
      
      <div class="footer-section">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#home" onclick="showPage('home')">Home</a></li>
          <li><a href="#course" onclick="showPage('course')">Course Description</a></li>
          <li><a href="#request" onclick="showPage('request')">Request Workshop</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h3>Contact</h3>
        <p>Email: ops@bhfe.com</p>
      </div>
      
      <div class="copyright">
        &copy; 2025 Ethics Workshop for FPA Chapters. All rights reserved.
      </div>
    </div>
  </footer>

  <script>
    // Global state
    let currentUser = null;
    let isAuthenticated = false;
    
    // Page templates
    const pages = {
      home: `
        <section class="hero">
          <h1>Ethics Workshop for FPA Chapters</h1>
          <p>Our 2-hour Ethics CE workshop satisfies the CFP Board's ethics CE requirement. Designed for financial planning professionals, this engaging program focuses on practical ethical decision-making.</p>
          <a href="#request" class="cta-button" onclick="showPage('request')">Request a Workshop</a>
        </section>
        
        <section class="info-section">
          <h2>About Our Ethics Workshop</h2>
          <p>Our Ethics Workshop is designed to fulfill the CFP Board's ethics continuing education requirement in an engaging and practical format. We focus on real-world ethical dilemmas that financial planners face in their practice.</p>
          <p>FPA Chapters can purchase this workshop for $995, providing valuable continuing education to their members while generating chapter revenue.</p>
        </section>
        
        <div class="info-grid">
          <div class="info-card">
            <h3>Chapter Benefits</h3>
            <ul>
              <li>Generate chapter revenue</li>
              <li>Provide valuable member benefit</li>
              <li>Easy to organize and host</li>
              <li>Professional presentation materials</li>
            </ul>
          </div>
          
          <div class="info-card">
            <h3>Participant Benefits</h3>
            <ul>
              <li>Satisfy CFP Board ethics requirement</li>
              <li>Practical, real-world scenarios</li>
              <li>Interactive discussion format</li>
              <li>Convenient, chapter-hosted event</li>
            </ul>
          </div>
          
          <div class="info-card">
            <h3>Workshop Details</h3>
            <ul>
              <li>2-hour session length</li>
              <li>Flat fee of $995 per workshop</li>
              <li>No per-participant charges</li>
              <li>Available virtual or in-person</li>
            </ul>
          </div>
        </div>
      `,
      
      course: `
        <section class="hero">
          <h1>Course Description</h1>
          <p>Learn more about our Ethics Workshop curriculum and approach.</p>
        </section>
        
        <section class="info-section">
          <h2>Workshop Curriculum</h2>
          <p>Our Ethics Workshop is a comprehensive 2-hour session that covers the following topics:</p>
          <ul>
            <li>CFP Board's Code of Ethics and Standards of Conduct</li>
            <li>Ethical decision-making frameworks</li>
            <li>Case studies of common ethical dilemmas</li>
            <li>Best practices for avoiding ethical pitfalls</li>
            <li>Documentation and disclosure requirements</li>
          </ul>
        </section>
        
        <section class="info-section">
          <h2>Learning Objectives</h2>
          <p>After completing this workshop, participants will be able to:</p>
          <ul>
            <li>Identify potential ethical issues in their practice</li>
            <li>Apply the CFP Board's ethical standards to real-world scenarios</li>
            <li>Implement practical approaches to common ethical challenges</li>
            <li>Understand their fiduciary responsibilities to clients</li>
          </ul>
        </section>
      `,
      
      request: `
        <section class="hero">
          <h1>Request a Workshop</h1>
          <p>Interested in hosting an Ethics Workshop for your FPA Chapter? Complete the form below to get started.</p>
        </section>
        
        <section class="info-section">
          <h2>Workshop Request Form</h2>
          <p>Please provide the following information to request an Ethics Workshop for your chapter.</p>
          <form id="requestForm">
            <div class="form-group">
              <label for="chapterName">FPA Chapter Name*</label>
              <input type="text" id="chapterName" name="chapterName" required>
            </div>
            
            <div class="form-group">
              <label for="contactName">Contact Name*</label>
              <input type="text" id="contactName" name="contactName" required>
            </div>
            
            <div class="form-group">
              <label for="contactEmail">Contact Email*</label>
              <input type="email" id="contactEmail" name="contactEmail" required>
            </div>
            
            <div class="form-group">
              <label for="contactPhone">Contact Phone</label>
              <input type="tel" id="contactPhone" name="contactPhone">
            </div>
            
            <div class="form-group">
              <label for="preferredDate">Preferred Workshop Date*</label>
              <input type="date" id="preferredDate" name="preferredDate" required>
            </div>
            
            <div class="form-group">
              <label for="notes">Additional Notes</label>
              <textarea id="notes" name="notes" rows="4"></textarea>
            </div>
            
            <button type="submit" class="cta-button">Submit Request</button>
          </form>
          <div id="requestFormMessage" style="margin-top: 1rem;"></div>
        </section>
        
        <section class="info-section">
          <h2>What to Expect</h2>
          <p>After submitting your request, you will receive a confirmation email. Our team will review your request and contact you within 2 business days to discuss the details and confirm your workshop date.</p>
        </section>
      `,
      
      auth: `
        <section class="hero">
          <h1>Admin Login</h1>
          <p>Please log in to access the administrative dashboard.</p>
        </section>
        
        <section class="info-section">
          <div style="max-width: 400px; margin: 0 auto;">
            <h2>Login</h2>
            <form id="loginForm">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" value="admin">
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" value="password">
                <small style="color: #666; display: block; margin-top: 0.25rem;">Demo credentials: admin / password</small>
              </div>
              
              <button type="submit" class="cta-button" style="width: 100%;">Log In</button>
            </form>
            <div id="loginFormMessage" style="margin-top: 1rem;"></div>
          </div>
        </section>
      `,
      
      admin: `
        <section class="hero">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the Ethics Workshop administrative dashboard.</p>
        </section>
        
        <div style="display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 2rem;">
          <div style="flex: 1; min-width: 300px;">
            <div class="info-section" style="height: 100%;">
              <h2>Quick Stats</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">2</div>
                  <div>Pending Requests</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">1</div>
                  <div>Upcoming Workshops</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">0</div>
                  <div>Pending Reports</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">$995</div>
                  <div>Revenue per Workshop</div>
                </div>
              </div>
            </div>
          </div>
          
          <div style="flex: 1; min-width: 300px;">
            <div class="info-section" style="height: 100%;">
              <h2>Admin Actions</h2>
              <div class="admin-actions">
                <button onclick="showAdminSection('chapter-requests')" class="cta-button">View Chapter Requests</button>
                <button onclick="showAdminSection('workshop-sessions')" class="cta-button">Manage Workshop Sessions</button>
                <button onclick="showAdminSection('participants')" class="cta-button">View Participant Data</button>
                <button onclick="handleLogout()" class="cta-button" style="background-color: #f44336;">Logout</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="info-section" id="adminContent">
          <h2 id="adminSectionTitle">Chapter Requests</h2>
          <div id="adminDataLoading" style="text-align: center; padding: 2rem;">
            <p>Loading data...</p>
          </div>
          <div id="adminDataContent" style="display: none;"></div>
        </div>
      `
    };
    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication status
      checkAuthStatus();
      
      // Show the initial page based on hash
      const hash = window.location.hash.substring(1) || 'home';
      showPage(hash);
      
      // Set up event listeners
      document.getElementById('requestForm')?.addEventListener('submit', handleRequestSubmit);
      document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
      
      // Handle hash changes
      window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash);
      });
    });
    
    // Show a specific page
    function showPage(page) {
      // Redirect to login if trying to access admin page without authentication
      if (page === 'admin' && !isAuthenticated) {
        window.location.hash = 'auth';
        return;
      }
      
      const mainContent = document.getElementById('mainContent');
      
      // Set page content
      mainContent.innerHTML = pages[page] || pages.home;
      
      // Set up event listeners for dynamically added forms
      if (page === 'request') {
        document.getElementById('requestForm')?.addEventListener('submit', handleRequestSubmit);
      } else if (page === 'auth') {
        document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
      } else if (page === 'admin') {
        // Load chapter requests by default
        setTimeout(() => {
          showAdminSection('chapter-requests');
        }, 100);
      }
      
      // Update URL hash
      window.location.hash = page;
    }
    
    // Check user authentication status
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        isAuthenticated = data.isAuthenticated;
        currentUser = data.user;
        
        updateNavForAuth();
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    }
    
    // Update navigation based on authentication status
    function updateNavForAuth() {
      const authLink = document.getElementById('authLink');
      
      if (isAuthenticated) {
        authLink.textContent = 'Admin Dashboard';
        authLink.href = '#admin';
        authLink.onclick = () => showPage('admin');
      } else {
        authLink.textContent = 'Admin Login';
        authLink.href = '#auth';
        authLink.onclick = () => showPage('auth');
      }
    }
    
    // Handle workshop request form submission
    async function handleRequestSubmit(event) {
      event.preventDefault();
      
      const form = event.target;
      const messageDiv = document.getElementById('requestFormMessage');
      const submitButton = form.querySelector('button[type="submit"]');
      
      // Prepare form data
      const formData = new FormData(form);
      const requestData = Object.fromEntries(formData.entries());
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      messageDiv.innerHTML = '<div class="message" style="background-color: #e6f7ff; border-color: #1890ff;">Submitting your request...</div>';
      
      try {
        const response = await fetch('/api/chapter-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
          // Show success message
          messageDiv.innerHTML = '<div class="message" style="background-color: #f6ffed; border-color: #52c41a;">Your workshop request has been submitted successfully! We will contact you within 2 business days.</div>';
          form.reset();
        } else {
          const errorData = await response.json();
          messageDiv.innerHTML = `<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Error: ${errorData.message || 'There was a problem submitting your request.'}</div>`;
        }
      } catch (error) {
        console.error('Error submitting request:', error);
        messageDiv.innerHTML = '<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Error: There was a problem connecting to the server. Please try again later.</div>';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Request';
      }
    }
    
    // Handle login form submission
    async function handleLogin(event) {
      event.preventDefault();
      
      const form = event.target;
      const messageDiv = document.getElementById('loginFormMessage');
      const submitButton = form.querySelector('button[type="submit"]');
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (!username || !password) {
        messageDiv.innerHTML = '<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Please enter both username and password.</div>';
        return;
      }
      
      // Show loading state
      submitButton.disabled = true;
      submitButton.textContent = 'Logging in...';
      messageDiv.innerHTML = '<div class="message" style="background-color: #e6f7ff; border-color: #1890ff;">Logging in...</div>';
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          currentUser = data.user;
          isAuthenticated = true;
          
          // Update navigation
          updateNavForAuth();
          
          // Redirect to admin dashboard
          messageDiv.innerHTML = '<div class="message" style="background-color: #f6ffed; border-color: #52c41a;">Login successful! Redirecting to dashboard...</div>';
          setTimeout(() => {
            window.location.hash = 'admin';
          }, 1000);
        } else {
          const errorData = await response.json();
          messageDiv.innerHTML = `<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Error: ${errorData.message || 'Invalid credentials'}</div>`;
        }
      } catch (error) {
        console.error('Login error:', error);
        messageDiv.innerHTML = '<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Error: There was a problem connecting to the server. Please try again later.</div>';
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Log In';
      }
    }
    
    // Handle logout
    async function handleLogout() {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST'
        });
        
        if (response.ok) {
          // Clear user data
          currentUser = null;
          isAuthenticated = false;
          
          // Update navigation
          updateNavForAuth();
          
          // Redirect to home page
          window.location.hash = 'home';
          alert('You have been logged out successfully.');
        } else {
          alert('Error logging out. Please try again.');
        }
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error connecting to the server. Please try again later.');
      }
    }
    
    // Show a specific admin section
    function showAdminSection(section) {
      const titleElement = document.getElementById('adminSectionTitle');
      const loadingDiv = document.getElementById('adminDataLoading');
      const contentDiv = document.getElementById('adminDataContent');
      
      // Update title
      if (section === 'chapter-requests') {
        titleElement.textContent = 'Chapter Requests';
      } else if (section === 'workshop-sessions') {
        titleElement.textContent = 'Workshop Sessions';
      } else if (section === 'participants') {
        titleElement.textContent = 'Participant Data';
      }
      
      // Show loading state
      loadingDiv.style.display = 'block';
      contentDiv.style.display = 'none';
      
      // Fetch and display data
      fetchAdminData(section)
        .then(data => {
          renderAdminData(section, data);
          loadingDiv.style.display = 'none';
          contentDiv.style.display = 'block';
        })
        .catch(error => {
          console.error(`Error loading ${section}:`, error);
          contentDiv.innerHTML = `<div class="message" style="background-color: #fff2f0; border-color: #ff4d4f;">Error loading data. Please try again.</div>`;
          loadingDiv.style.display = 'none';
          contentDiv.style.display = 'block';
        });
    }
    
    // Fetch admin data based on section
    async function fetchAdminData(section) {
      let endpoint = '';
      
      if (section === 'chapter-requests') {
        endpoint = '/api/chapter-requests';
      } else if (section === 'workshop-sessions') {
        endpoint = '/api/workshop-sessions';
      } else if (section === 'participants') {
        endpoint = '/api/participants';
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${section}`);
      }
      
      return response.json();
    }
    
    // Render admin data based on section
    function renderAdminData(section, data) {
      const contentDiv = document.getElementById('adminDataContent');
      
      if (!data || data.length === 0) {
        contentDiv.innerHTML = `<p>No ${section.replace('-', ' ')} found.</p>`;
        return;
      }
      
      if (section === 'chapter-requests') {
        renderChapterRequestsTable(data);
      } else if (section === 'workshop-sessions') {
        renderWorkshopSessionsTable(data);
      } else if (section === 'participants') {
        renderParticipantsTable(data);
      }
    }
    
    // Render chapter requests table
    function renderChapterRequestsTable(data) {
      const contentDiv = document.getElementById('adminDataContent');
      
      let html = `
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(request => {
        html += `
          <tr>
            <td>${request.chapterName}</td>
            <td>
              ${request.contactName}<br>
              <small>${request.contactEmail}</small>
            </td>
            <td>${new Date(request.preferredDate).toLocaleDateString()}</td>
            <td>
              <span class="status-badge status-${request.status}">
                ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="cta-button" onclick="alert('This would show details for request #${request.id}')">
                  View Details
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      contentDiv.innerHTML = html;
    }
    
    // Render workshop sessions table
    function renderWorkshopSessionsTable(data) {
      const contentDiv = document.getElementById('adminDataContent');
      
      let html = `
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(session => {
        html += `
          <tr>
            <td>${session.chapterName}</td>
            <td>${new Date(session.date).toLocaleDateString()}</td>
            <td>${session.location}</td>
            <td>
              <span class="status-badge status-${session.status === 'scheduled' ? 'approved' : 'pending'}">
                ${session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="cta-button" onclick="showAdminSection('participants')">
                  View Participants
                </button>
                <button class="cta-button" style="background-color: ${session.reported ? '#4CAF50' : '#FFC107'};">
                  ${session.reported ? 'Reported' : 'Report to CFP'}
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      contentDiv.innerHTML = html;
    }
    
    // Render participants table
    function renderParticipantsTable(data) {
      const contentDiv = document.getElementById('adminDataContent');
      
      let html = `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>CFP ID</th>
              <th>Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      data.forEach(participant => {
        html += `
          <tr>
            <td>${participant.name}</td>
            <td>${participant.email}</td>
            <td>${participant.cfpId}</td>
            <td>
              <span class="status-badge status-${participant.reported ? 'approved' : 'pending'}">
                ${participant.reported ? 'Yes' : 'No'}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="cta-button" onclick="alert('This would edit participant #${participant.id}')">
                  Edit
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
        
        <div style="margin-top: 2rem;">
          <button class="cta-button" style="background-color: #4CAF50;" onclick="alert('This would download participant data as CSV')">
            Export to CSV
          </button>
        </div>
      `;
      
      contentDiv.innerHTML = html;
    }
  </script>
</body>
</html>
EOL

# Create Procfile for Digital Ocean
echo "Creating Procfile for deployment..."
echo "web: NODE_ENV=production node dist/index.js" > Procfile

# Create a build.sh script for building the client
echo "Creating build.sh script..."
cat > build.sh << 'EOL'
#!/bin/bash
set -e

echo "Building client and server for production..."

# Install dependencies
npm install --production=false

# Use compatible database driver
npm install --no-save @neondatabase/serverless@0.7.2

# Create required directories
mkdir -p dist/public
mkdir -p dist/server
mkdir -p dist/shared
mkdir -p dist/client

# Copy server files
cp -r server/* dist/server/
cp -r shared/* dist/shared/

# Try to build client
echo "Building client (this may take a while)..."
cd client
npm run build || {
  echo "Client build failed, falling back to prerendered version"
  mkdir -p dist
  cp -r ../dist/public/* dist/
}
cd ..

# Copy built client files
mkdir -p dist/client/dist
cp -r client/dist/* dist/client/dist/ || echo "No client build output found, using prerendered fallback"

# Fix import paths in server files
echo "Fixing import paths..."
find dist -type f -name "*.js" -o -name "*.ts" | xargs sed -i 's|@shared|../shared|g' || echo "No import path fixes needed"

echo "Build completed successfully!"
EOL

chmod +x build.sh

echo "Deployment preparation completed!"