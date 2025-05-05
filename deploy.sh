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
npm install @neondatabase/serverless@0.7.2

# Create required directories
echo "Creating build directories..."
mkdir -p dist/client
mkdir -p server/public
mkdir -p dist/public

# Create a placeholder file in server/public
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > server/public/index.html
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > dist/public/index.html

# Build the frontend
echo "Building frontend..."
npm run build

# The script will end here for the Digital Ocean deployment
# The platform will use the Procfile to start the application

# Create a Procfile for Digital Ocean
echo "Creating Procfile..."
echo "web: NODE_ENV=production PORT=8080 npx tsx server/index.ts" > Procfile