#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Install dependencies including dev dependencies needed for the build
echo "Installing dependencies and build tools..."
npm install --production=false

# Make sure we have all required dev dependencies for build
echo "Ensuring all build tools are available..."
npm install --no-save @vitejs/plugin-react vite esbuild tailwindcss postcss autoprefixer tsx

# Force install a specific version of Neon Database driver that works
echo "Installing compatible database driver..."
npm install --no-save @neondatabase/serverless@0.7.2

# Create required directories
echo "Creating build directories..."
mkdir -p dist/client
mkdir -p server/public
mkdir -p dist/public

# Create simple index files for the public directories
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > server/public/index.html
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > dist/public/index.html

# Build the frontend - this creates the necessary files
echo "Building frontend..."
NODE_ENV=production npm run build

# Create a Procfile for Digital Ocean
echo "Creating Procfile..."
echo "web: NODE_ENV=production PORT=8080 npx tsx server/index.ts" > Procfile

echo "Deployment preparation complete!"