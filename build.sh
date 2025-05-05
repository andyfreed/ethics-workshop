#!/bin/bash

# This script prepares the application for deployment

# Ensure script fails on error
set -e

echo "Installing dependencies..."
npm install --production=false

echo "Creating directories..."
mkdir -p dist/client

# Create a simple health check file
echo "Setting up health check route..."
echo '
const express = require("express");
const app = express();
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});
' > dist/healthcheck.js

# Initialize the database schema
echo "Initializing database schema..."
npx drizzle-kit push

echo "Build completed successfully"