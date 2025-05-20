#!/bin/bash

# Start Ethics Workshop in development mode
echo "Starting Ethics Workshop in development mode..."

# Check if .env file exists, if not, create from example
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your Supabase credentials."
  else
    echo "Warning: No .env or .env.example file found. You may need to create one manually."
  fi
fi

# Start the backend server in the background
echo "Starting backend server on port 5002..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend server
echo "Starting frontend server on port 3002..."
cd client && npm run dev

# When the frontend is stopped, stop the backend as well
kill $BACKEND_PID
echo "Development servers stopped." 