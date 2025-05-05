FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without pruning dev dependencies
RUN npm install --production=false

# Copy source code
COPY . .

# Skip frontend build and just copy static assets
# This avoids issues with Vite build
RUN mkdir -p dist/client

# Initialize database schema
RUN npx drizzle-kit push

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start command - run directly from source
CMD ["node", "server/index.js"]