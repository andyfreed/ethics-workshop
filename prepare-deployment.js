/**
 * Simple script to prepare files for deployment
 */
const fs = require('fs');
const path = require('path');

// Create necessary directories
const directories = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist', 'public'),
  path.join(__dirname, 'server', 'public')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create a simple placeholder HTML file
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ethics Workshop - FPA Chapters</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9f9f9;
      color: #191102;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      color: #ffb300;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ethics Workshop</h1>
    <p>Welcome to the FPA Ethics Workshop Portal. This application is currently in deployment mode.</p>
    <p>If you're seeing this page, your deployment is in progress. The full application should be available soon.</p>
  </div>
</body>
</html>
`;

// Write the HTML file to both locations
const htmlFiles = [
  path.join(__dirname, 'dist', 'public', 'index.html'),
  path.join(__dirname, 'server', 'public', 'index.html')
];

htmlFiles.forEach(file => {
  fs.writeFileSync(file, htmlContent);
  console.log(`Created file: ${file}`);
});

console.log('Deployment preparation complete!');