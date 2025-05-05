#!/bin/bash

# This script prepares and runs the application for production deployment

# Ensure script fails on error
set -e

echo "Preparing for deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production=false

# Create required directories
echo "Creating build directories..."
mkdir -p dist/client
mkdir -p server/public

# Create a placeholder file in server/public
echo '<html><body><h1>Ethics Workshop</h1></body></html>' > server/public/index.html

# Build the frontend
echo "Building frontend..."
npm run build

# Start the server
echo "Starting server..."
NODE_ENV=production PORT=8080 npx tsx server/index.ts