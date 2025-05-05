#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Install dependencies including dev dependencies needed for the build
echo "Installing dependencies and build tools..."
npm install --production=false
npm install --no-save @vitejs/plugin-react vite esbuild @tailwindcss/vite tsx postcss autoprefixer tailwindcss

# Force install a specific version of Neon Database driver that works
echo "Installing compatible database driver..."
npm install --no-save @neondatabase/serverless@0.7.2

# Create required directories
echo "Creating build directories..."
mkdir -p dist
mkdir -p dist/client
mkdir -p server/public
mkdir -p dist/public

# Run the prepare-deployment script to create necessary files
echo "Running prepare-deployment script..."
node prepare-deployment.js

# Copy the server directory to dist for direct execution
echo "Copying server files..."
cp -r server dist/

# Copy the shared directory to dist for schema access
echo "Copying shared files..."
cp -r shared dist/

# Create a health check endpoint handler
echo "Creating health check endpoint..."
cat > dist/server/health.js << EOL
export function setupHealthCheck(app) {
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
}
EOL

# Update server/index.ts to import the health check module
echo "Updating server entry point for health check..."
if ! grep -q "setupHealthCheck" dist/server/index.ts; then
  sed -i '/import/a import { setupHealthCheck } from "./health.js";' dist/server/index.ts
  sed -i '/registerRoutes/a setupHealthCheck(app);' dist/server/index.ts
fi

# Create a Procfile for Digital Ocean
echo "Creating Procfile..."
echo "web: NODE_ENV=production PORT=8080 npx tsx dist/server/index.ts" > Procfile

echo "Deployment preparation complete!"