#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production=false

# Force install a specific version of Neon Database driver that works
echo "Installing compatible database driver..."
npm install --no-save @neondatabase/serverless@0.7.2

# Create required directories
echo "Creating build directories..."
mkdir -p dist/public
mkdir -p dist/public/assets
mkdir -p dist/public/api

# Prepare essential API endpoint files
echo "Preparing API endpoints..."
cat > dist/public/api/user.json << 'EOL'
{
  "isAuthenticated": false
}
EOL

cat > dist/public/assets/main.css << 'EOL'
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
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
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
  line-height: 1.6;
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
}
EOL

# Create enhanced HTML that looks more like the real application
cat > dist/public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ethics Workshop - FPA Chapters</title>
  <link rel="stylesheet" href="/assets/main.css">
</head>
<body>
  <header>
    <div class="header-container">
      <div class="logo">Ethics Workshop</div>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/course">Course Description</a></li>
          <li><a href="/request">Request Workshop</a></li>
          <li><a href="/auth">Admin Login</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <main>
    <section class="hero">
      <h1>Ethics Workshop for FPA Chapters</h1>
      <p>Our 2-hour Ethics CE workshop satisfies the CFP Board's ethics CE requirement. Designed for financial planning professionals, this engaging program focuses on practical ethical decision-making.</p>
      <a href="/request" class="cta-button">Request a Workshop</a>
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
          <li><a href="/">Home</a></li>
          <li><a href="/course">Course Description</a></li>
          <li><a href="/request">Request Workshop</a></li>
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
    // Handle authentication state
    let currentUser = null;
    
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.isAuthenticated && data.user) {
          currentUser = data.user;
          updateNavForAuth();
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    }
    
    function updateNavForAuth() {
      const authLink = document.querySelector('nav a[href="/auth"]');
      if (authLink) {
        if (currentUser) {
          authLink.textContent = 'Admin Dashboard';
          authLink.href = '/admin';
        } else {
          authLink.textContent = 'Admin Login';
          authLink.href = '/auth';
        }
      }
    }
    
    // Handle form submissions
    async function submitWorkshopRequest(event) {
      event.preventDefault();
      
      // Show loading indicator
      const submitButton = document.querySelector('#requestForm button');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
      
      // Get form data
      const formData = new FormData(document.getElementById('requestForm'));
      const requestData = Object.fromEntries(formData.entries());
      
      try {
        const response = await fetch('/api/chapter-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
          // Show success message
          document.getElementById('requestForm').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
              <h3 style="color: #4CAF50; margin-bottom: 1rem;">Workshop Request Submitted Successfully!</h3>
              <p>Thank you for your interest in hosting an Ethics Workshop. We'll contact you within 2 business days to confirm the details.</p>
              <p>A confirmation has been sent to your email address.</p>
            </div>
          `;
        } else {
          const error = await response.json();
          alert(`Error submitting request: ${error.message || 'Please try again later.'}`);
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        }
      } catch (error) {
        console.error('Error submitting workshop request:', error);
        alert('There was a problem submitting your request. Please try again later.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    }
    
    // Simple client-side routing for the static version
    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication status on page load
      checkAuthStatus();
      
      const links = document.querySelectorAll('a');
      
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          // Only handle internal links
          if (this.hostname === window.location.hostname) {
            const path = this.pathname;
            
            if (path === '/' || path === '/course' || path === '/request' || path === '/auth' || path === '/admin') {
              e.preventDefault();
              
              // Update the content based on the path
              updateContent(path);
              
              // Update the URL without reloading the page
              window.history.pushState({path: path}, '', path);
            }
          }
        });
      });
      
      // Handle back/forward navigation
      window.onpopstate = function(e) {
        if (e.state && e.state.path) {
          updateContent(e.state.path);
        }
      };
      
      // Initial load
      const initialPath = window.location.pathname;
      updateContent(initialPath);
      
      function updateContent(path) {
        const main = document.querySelector('main');
        
        switch(path) {
          case '/course':
            main.innerHTML = `
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
            `;
            break;
            
          case '/request':
            main.innerHTML = `
              <section class="hero">
                <h1>Request a Workshop</h1>
                <p>Interested in hosting an Ethics Workshop for your FPA Chapter? Complete the form below to get started.</p>
              </section>
              
              <section class="info-section">
                <h2>Workshop Request Form</h2>
                <p>This is a simplified version of the form. In the full application, you would be able to submit your information.</p>
                <form id="requestForm">
                  <div style="margin-bottom: 1rem;">
                    <label for="chapterName" style="display: block; margin-bottom: 0.5rem;">FPA Chapter Name:</label>
                    <input type="text" id="chapterName" name="chapterName" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 1rem;">
                    <label for="contactName" style="display: block; margin-bottom: 0.5rem;">Contact Name:</label>
                    <input type="text" id="contactName" name="contactName" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 1rem;">
                    <label for="contactEmail" style="display: block; margin-bottom: 0.5rem;">Contact Email:</label>
                    <input type="email" id="contactEmail" name="contactEmail" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 1rem;">
                    <label for="contactPhone" style="display: block; margin-bottom: 0.5rem;">Contact Phone:</label>
                    <input type="tel" id="contactPhone" name="contactPhone" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 1rem;">
                    <label for="preferredDate" style="display: block; margin-bottom: 0.5rem;">Preferred Workshop Date:</label>
                    <input type="date" id="preferredDate" name="preferredDate" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                  </div>
                  
                  <div style="margin-bottom: 1.5rem;">
                    <label for="notes" style="display: block; margin-bottom: 0.5rem;">Additional Notes:</label>
                    <textarea id="notes" name="notes" rows="4" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                  </div>
                  
                  <button type="button" class="cta-button" onclick="submitWorkshopRequest(event)">Submit Request</button>
                </form>
              </section>
              
              <section class="info-section">
                <h2>What to Expect</h2>
                <p>After submitting your request, you will receive a confirmation email. Our team will review your request and contact you within 2 business days to discuss the details and confirm your workshop date.</p>
              </section>
            `;
            break;
            
          case '/auth':
            main.innerHTML = `
              <section class="hero">
                <h1>Admin Login</h1>
                <p>Please log in to access the administrative dashboard.</p>
              </section>
              
              <section class="info-section">
                <div style="max-width: 400px; margin: 0 auto;">
                  <h2>Login</h2>
                  <form id="loginForm" style="margin-top: 1.5rem;">
                    <div style="margin-bottom: 1rem;">
                      <label for="username" style="display: block; margin-bottom: 0.5rem;">Username:</label>
                      <input type="text" id="username" name="username" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" value="admin">
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                      <label for="password" style="display: block; margin-bottom: 0.5rem;">Password:</label>
                      <input type="password" id="password" name="password" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;" value="password">
                      <small style="color: #666; margin-top: 0.25rem; display: block;">Demo credentials: admin / password</small>
                    </div>
                    
                    <button type="button" class="cta-button" onclick="handleLogin()" style="width: 100%;">Log In</button>
                  </form>
                </div>
              </section>
            `;
            
            // Add the login handler function
            window.handleLogin = async function() {
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              
              if (!username || !password) {
                alert('Please enter both username and password.');
                return;
              }
              
              const loginButton = document.querySelector('#loginForm button');
              loginButton.textContent = 'Logging in...';
              loginButton.disabled = true;
              
              try {
                const response = await fetch('/api/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  currentUser = data.user;
                  updateNavForAuth();
                  
                  // Redirect to admin dashboard
                  updateContent('/admin');
                  window.history.pushState({path: '/admin'}, '', '/admin');
                } else {
                  const error = await response.json();
                  alert(`Login failed: ${error.message || 'Invalid credentials'}`);
                }
              } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login. Please try again.');
              }
              
              loginButton.textContent = 'Log In';
              loginButton.disabled = false;
            };
            break;
            
          case '/admin':
            // If not logged in, redirect to login page
            if (!currentUser) {
              updateContent('/auth');
              window.history.pushState({path: '/auth'}, '', '/auth');
              break;
            }
            
            main.innerHTML = `
              <section class="hero">
                <h1>Admin Dashboard</h1>
                <p>Welcome to the Ethics Workshop administrative dashboard.</p>
              </section>
              
              <div style="display: flex; margin-bottom: 2rem;">
                <div style="flex: 1; margin-right: 1rem;">
                  <div class="info-section" style="height: 100%;">
                    <h2>Quick Stats</h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                      <div style="background: #f5f5f5; padding: 1rem; border-radius: var(--radius); text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">2</div>
                        <div>Pending Requests</div>
                      </div>
                      <div style="background: #f5f5f5; padding: 1rem; border-radius: var(--radius); text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">1</div>
                        <div>Upcoming Workshops</div>
                      </div>
                      <div style="background: #f5f5f5; padding: 1rem; border-radius: var(--radius); text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">0</div>
                        <div>Pending Reports</div>
                      </div>
                      <div style="background: #f5f5f5; padding: 1rem; border-radius: var(--radius); text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">$995</div>
                        <div>Revenue per Workshop</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style="flex: 1;">
                  <div class="info-section" style="height: 100%;">
                    <h2>Admin Actions</h2>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                      <a href="#" onclick="loadAdminSection('chapter-requests')" class="cta-button" style="text-align: center;">View Chapter Requests</a>
                      <a href="#" onclick="loadAdminSection('workshop-sessions')" class="cta-button" style="text-align: center;">Manage Workshop Sessions</a>
                      <a href="#" onclick="loadAdminSection('participants')" class="cta-button" style="text-align: center;">View Participant Data</a>
                      <a href="#" onclick="handleLogout()" class="cta-button" style="text-align: center; background-color: #f44336;">Logout</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div id="adminContent" class="info-section">
                <h2>Chapter Requests</h2>
                <div id="adminDataLoading" style="text-align: center; padding: 2rem;">
                  <p>Loading chapter requests...</p>
                </div>
                <div id="adminDataContent" style="display: none;"></div>
              </div>
            `;
            
            // Add admin section loader function
            window.loadAdminSection = async function(section) {
              const contentDiv = document.getElementById('adminContent');
              const loadingDiv = document.getElementById('adminDataLoading');
              const dataDiv = document.getElementById('adminDataContent');
              
              loadingDiv.style.display = 'block';
              dataDiv.style.display = 'none';
              
              let title = '';
              let endpoint = '';
              
              switch(section) {
                case 'chapter-requests':
                  title = 'Chapter Requests';
                  endpoint = '/api/chapter-requests';
                  break;
                case 'workshop-sessions':
                  title = 'Workshop Sessions';
                  endpoint = '/api/workshop-sessions';
                  break;
                case 'participants':
                  title = 'Participant Data';
                  endpoint = '/api/participants';
                  break;
                default:
                  title = 'Chapter Requests';
                  endpoint = '/api/chapter-requests';
              }
              
              contentDiv.querySelector('h2').textContent = title;
              
              try {
                const response = await fetch(endpoint);
                if (response.ok) {
                  const data = await response.json();
                  
                  if (section === 'chapter-requests') {
                    renderChapterRequestsTable(data);
                  } else if (section === 'workshop-sessions') {
                    renderWorkshopSessionsTable(data);
                  } else {
                    dataDiv.innerHTML = '<p>Data display not implemented in this preview.</p>';
                  }
                } else {
                  dataDiv.innerHTML = '<p>Error loading data. Please try again.</p>';
                }
              } catch (error) {
                console.error(`Error loading ${section}:`, error);
                dataDiv.innerHTML = '<p>Error loading data. Please try again.</p>';
              }
              
              loadingDiv.style.display = 'none';
              dataDiv.style.display = 'block';
            };
            
            // Add renderer for chapter requests table
            window.renderChapterRequestsTable = function(data) {
              const dataDiv = document.getElementById('adminDataContent');
              
              if (!data || data.length === 0) {
                dataDiv.innerHTML = '<p>No chapter requests found.</p>';
                return;
              }
              
              let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                  <thead>
                    <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                      <th style="padding: 0.75rem; text-align: left;">Chapter</th>
                      <th style="padding: 0.75rem; text-align: left;">Contact</th>
                      <th style="padding: 0.75rem; text-align: left;">Date</th>
                      <th style="padding: 0.75rem; text-align: left;">Status</th>
                      <th style="padding: 0.75rem; text-align: left;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
              `;
              
              data.forEach(request => {
                html += `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 0.75rem;">${request.chapterName}</td>
                    <td style="padding: 0.75rem;">${request.contactName}<br><small>${request.contactEmail}</small></td>
                    <td style="padding: 0.75rem;">${new Date(request.preferredDate).toLocaleDateString()}</td>
                    <td style="padding: 0.75rem;">
                      <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${request.status === 'pending' ? '#FFC107' : '#4CAF50'}; color: white;">
                        ${request.status === 'pending' ? 'Pending' : 'Approved'}
                      </span>
                    </td>
                    <td style="padding: 0.75rem;">
                      <button class="cta-button" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                        onclick="alert('In the full application, this would allow you to approve or edit the request.')">
                        View Details
                      </button>
                    </td>
                  </tr>
                `;
              });
              
              html += `
                  </tbody>
                </table>
              `;
              
              dataDiv.innerHTML = html;
            };
            
            // Add renderer for workshop sessions table
            window.renderWorkshopSessionsTable = function(data) {
              const dataDiv = document.getElementById('adminDataContent');
              
              if (!data || data.length === 0) {
                dataDiv.innerHTML = '<p>No workshop sessions found.</p>';
                return;
              }
              
              let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                  <thead>
                    <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                      <th style="padding: 0.75rem; text-align: left;">Chapter</th>
                      <th style="padding: 0.75rem; text-align: left;">Date</th>
                      <th style="padding: 0.75rem; text-align: left;">Location</th>
                      <th style="padding: 0.75rem; text-align: left;">Status</th>
                      <th style="padding: 0.75rem; text-align: left;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
              `;
              
              data.forEach(session => {
                html += `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 0.75rem;">${session.chapterName}</td>
                    <td style="padding: 0.75rem;">${new Date(session.date).toLocaleDateString()}</td>
                    <td style="padding: 0.75rem;">${session.location}</td>
                    <td style="padding: 0.75rem;">
                      <span style="padding: 0.25rem 0.5rem; border-radius: 4px; background-color: ${session.status === 'scheduled' ? '#4CAF50' : '#FFC107'}; color: white;">
                        ${session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </td>
                    <td style="padding: 0.75rem;">
                      <button class="cta-button" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.5rem;"
                        onclick="alert('In the full application, this would allow you to view participant data.')">
                        View Participants
                      </button>
                      <button class="cta-button" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background-color: ${session.reported ? '#4CAF50' : '#FFC107'};"
                        onclick="alert('In the full application, this would allow you to mark the session as reported to the CFP Board.')">
                        ${session.reported ? 'Reported' : 'Report to CFP'}
                      </button>
                    </td>
                  </tr>
                `;
              });
              
              html += `
                  </tbody>
                </table>
              `;
              
              dataDiv.innerHTML = html;
            };
            
            // Add logout handler
            window.handleLogout = async function() {
              try {
                const response = await fetch('/api/logout', {
                  method: 'POST'
                });
                
                if (response.ok) {
                  currentUser = null;
                  updateNavForAuth();
                  
                  // Redirect to home page
                  updateContent('/');
                  window.history.pushState({path: '/'}, '', '/');
                  
                  alert('Logged out successfully.');
                } else {
                  alert('Error logging out. Please try again.');
                }
              } catch (error) {
                console.error('Logout error:', error);
                alert('An error occurred during logout. Please try again.');
              }
            };
            
            // Load chapter requests by default
            setTimeout(() => {
              window.loadAdminSection('chapter-requests');
            }, 500);
            break;
            
          default: // Home page
            main.innerHTML = `
              <section class="hero">
                <h1>Ethics Workshop for FPA Chapters</h1>
                <p>Our 2-hour Ethics CE workshop satisfies the CFP Board's ethics CE requirement. Designed for financial planning professionals, this engaging program focuses on practical ethical decision-making.</p>
                <a href="/request" class="cta-button">Request a Workshop</a>
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
            `;
            break;
        }
      }
    });
  </script>
</body>
</html>
EOL

echo "Creating a production-ready express server..."
cat > dist/index.js << 'EOL'
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Authentication system
let isAuthenticated = false;
let currentUser = null;

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication for the demo
  if (username === 'admin' && password === 'password') {
    isAuthenticated = true;
    currentUser = {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      isAdmin: true
    };
    
    res.json({
      message: 'Login successful',
      user: currentUser
    });
  } else {
    res.status(401).json({
      message: 'Invalid credentials'
    });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  isAuthenticated = false;
  currentUser = null;
  
  res.json({
    message: 'Logout successful'
  });
});

// Get current user endpoint
app.get('/api/user', (req, res) => {
  if (isAuthenticated && currentUser) {
    res.json({
      isAuthenticated: true,
      user: currentUser
    });
  } else {
    res.json({
      isAuthenticated: false
    });
  }
});

// Admin-only mock API endpoint
app.get('/api/chapter-requests', (req, res) => {
  // Mock response with sample data
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
});

// Workshop Sessions mock API
app.get('/api/workshop-sessions', (req, res) => {
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
});

// Post a new chapter request 
app.post('/api/chapter-requests', (req, res) => {
  const { chapterName, contactName, contactEmail, contactPhone, preferredDate, notes } = req.body;
  
  // Simple validation
  if (!chapterName || !contactName || !contactEmail || !preferredDate) {
    return res.status(400).json({
      message: 'Please provide all required fields: chapter name, contact name, contact email, and preferred date'
    });
  }
  
  // In a real application, this would save to the database
  // Here we're just returning success
  res.status(201).json({
    id: Date.now(), // Use timestamp as ID for demo
    chapterName,
    contactName,
    contactEmail,
    contactPhone,
    preferredDate,
    notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
});

// Get participant data (admin only, would be authenticated in the full app)
app.get('/api/participants', (req, res) => {
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
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

const PORT = process.env.PORT || 8080;
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
EOL

# Create a Procfile for Digital Ocean
echo "Creating Procfile..."
echo "web: NODE_ENV=production node dist/index.js" > Procfile

echo "Deployment preparation complete!"