#!/bin/bash

# Exit on error
set -e

# Copy .env to server directory to ensure backend picks up Supabase credentials
if [ -f .env ]; then
  cp .env server/.env
  echo "[Backend] Copied .env to server/.env"
else
  echo "[Backend] No .env file found in project root! Supabase will not connect."
fi

# Start the backend server on port 5002
(
  echo "[Backend] Installing dependencies and starting server on port 5002..."
  cd server
  npm install
  PORT=5002 node -r dotenv/config --import tsx index.ts &
  BACKEND_PID=$!
  cd ..
) &

# Wait a bit to ensure backend starts
sleep 2

# Ensure client/.env exists with correct API URL
if [ ! -f client/.env ]; then
  echo "VITE_API_URL=http://localhost:5002" > client/.env
  echo "[Frontend] Created client/.env with VITE_API_URL=http://localhost:5002"
else
  echo "[Frontend] client/.env already exists."
fi

# Start the frontend dev server
(
  echo "[Frontend] Installing dependencies and starting Vite dev server on port 5173..."
  cd client
  npm install
  npm run dev
) &

wait

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

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 3

# Start the frontend server
echo "Starting frontend server on port 3002..."
cd client && npm run dev

# When the frontend is stopped, stop the backend as well
kill $BACKEND_PID
echo "Development servers stopped." 