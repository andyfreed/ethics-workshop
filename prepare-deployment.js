const fs = require('fs');
const path = require('path');

// Create directories that might be needed for deployment
console.log('Preparing directories for deployment...');

// Create server/public directory if it doesn't exist
const publicDir = path.join(__dirname, 'server', 'public');
if (!fs.existsSync(publicDir)) {
  console.log(`Creating directory: ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
  
  // Create a basic index.html to ensure the directory is not empty
  const indexPath = path.join(publicDir, 'index.html');
  fs.writeFileSync(indexPath, '<html><body><h1>Ethics Workshop</h1></body></html>');
  console.log(`Created placeholder index.html in ${publicDir}`);
}

// Create other necessary directories
const distClientDir = path.join(__dirname, 'dist', 'client');
if (!fs.existsSync(distClientDir)) {
  console.log(`Creating directory: ${distClientDir}`);
  fs.mkdirSync(distClientDir, { recursive: true });
}

console.log('Deployment preparation complete!');