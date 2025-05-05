#!/bin/bash
# Build script for production deployment

echo "Starting production build process..."

# Build the client (React frontend)
echo "Building client..."
npm run build

# Create production-ready server structure
echo "Setting up server structure..."

# Ensure dist directory exists
mkdir -p dist

# Build the server using esbuild
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy necessary files for production
echo "Copying production assets..."

# Copy package files
cp package.json dist/
cp package-lock.json dist/

# Create .env file for production if it doesn't exist
if [ ! -f dist/.env ]; then
  echo "Creating production .env file..."
  touch dist/.env
  # Add your environment variables here if needed
  echo "NODE_ENV=production" >> dist/.env
fi

# Setup database
echo "Running database migrations..."
npx drizzle-kit push

echo "Build completed successfully!"
echo "To start the application in production, run: NODE_ENV=production node dist/index.js"