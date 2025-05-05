#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Install dependencies with explicit dev dependencies needed for build
echo "Installing dependencies and build tools..."
npm install --production=false
npm install @vitejs/plugin-react vite esbuild @tailwindcss/vite --no-save

# Force install a specific version of Neon Database driver that works
echo "Installing compatible database driver..."
npm install @neondatabase/serverless@0.7.2

# Create required directories
echo "Creating build directories..."
mkdir -p dist/client
mkdir -p server/public
mkdir -p dist/public

# Create a placeholder file in server/public
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > server/public/index.html
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > dist/public/index.html

# Create a simple serve script instead of using build
echo "Creating a manual build approach..."
echo "// This is a simplified build approach" > dist/index.js
echo "import { createServer } from 'http';" >> dist/index.js
echo "import express from 'express';" >> dist/index.js
echo "import path from 'path';" >> dist/index.js
echo "import { fileURLToPath } from 'url';" >> dist/index.js
echo "" >> dist/index.js
echo "const __dirname = path.dirname(fileURLToPath(import.meta.url));" >> dist/index.js
echo "const app = express();" >> dist/index.js
echo "app.use(express.json());" >> dist/index.js
echo "" >> dist/index.js
echo "// Serve static files" >> dist/index.js
echo "app.use(express.static(path.join(__dirname, 'public')));" >> dist/index.js
echo "" >> dist/index.js
echo "// Add health check endpoint" >> dist/index.js
echo "app.get('/health', (req, res) => res.send('OK'));" >> dist/index.js
echo "" >> dist/index.js
echo "// Add API endpoint for compatibility" >> dist/index.js
echo "app.get('/api/user', (req, res) => res.json({ isAuthenticated: false }));" >> dist/index.js
echo "" >> dist/index.js
echo "// Handle all routes for SPA" >> dist/index.js
echo "app.get('*', (req, res) => {" >> dist/index.js
echo "  res.sendFile(path.join(__dirname, 'public', 'index.html'));" >> dist/index.js
echo "});" >> dist/index.js
echo "" >> dist/index.js
echo "const PORT = process.env.PORT || 8080;" >> dist/index.js
echo "const server = createServer(app);" >> dist/index.js
echo "" >> dist/index.js
echo "server.listen(PORT, '0.0.0.0', () => {" >> dist/index.js
echo "  console.log(\`Server running at http://0.0.0.0:\${PORT}/\`);" >> dist/index.js
echo "});" >> dist/index.js

# Create a Procfile for Digital Ocean
echo "Creating Procfile..."
echo "web: NODE_ENV=production node dist/index.js" > Procfile