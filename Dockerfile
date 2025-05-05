FROM node:20-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source files
COPY . .

# Create static asset directory
RUN mkdir -p dist/client

# Build the client
RUN npm run build

# Compile TypeScript to JavaScript with production configuration
RUN npx tsc -p tsconfig.prod.json

# Expose port 8080 for Digital Ocean
EXPOSE 8080

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -qO- http://localhost:8080/health || exit 1

# Start the application - try JavaScript first, fallback to TypeScript
CMD ["sh", "-c", "if [ -f dist/server/index.js ]; then node dist/server/index.js; else npx tsx server/index.ts; fi"]