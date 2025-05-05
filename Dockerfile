FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without pruning dev dependencies
RUN npm install --production=false

# Copy source code
COPY . .

# Create client directory for static assets
RUN mkdir -p dist/client

# Install tsx globally for TypeScript execution
RUN npm install -g tsx

# Initialize database schema
RUN npx drizzle-kit push

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start command - run TypeScript directly with tsx
CMD ["npx", "tsx", "server/index.ts"]