FROM node:20-alpine

WORKDIR /app

# Install dependencies for better caching
COPY package*.json ./
RUN npm install --production=false

# Copy source files
COPY . .

# Create build directories that the app expects
RUN mkdir -p dist/client
RUN mkdir -p server/public
RUN echo '<html><body><h1>Ethics Workshop</h1></body></html>' > server/public/index.html

# Build the frontend (Vite build)
RUN npm run build

# Install required tools
RUN npm install -g tsx

# Expose port 8080 for Digital Ocean
EXPOSE 8080

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -qO- http://localhost:8080/health || exit 1

# Start the application with tsx directly
CMD ["npx", "tsx", "server/index.ts"]