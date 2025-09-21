# SMS Auto-Bot System - Production Dockerfile
# Multi-stage build for production deployment on Easypanel

# Stage 1: Build the React application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Setup Nginx server for serving static files
FROM nginx:alpine AS production

# Install Node.js for running the server
RUN apk add --no-cache nodejs npm

# Copy built React app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server files
COPY --from=builder /app/server /app/server
COPY --from=builder /app/scripts /app/scripts
COPY --from=builder /app/package*.json /app/

# Install server dependencies only
WORKDIR /app
RUN npm ci --only=production

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create start script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Starting SMS Auto-Bot System in Production Mode..."' >> /start.sh && \
    echo 'echo "Frontend: Nginx serving React app on port 80"' >> /start.sh && \
    echo 'echo "Backend: Node.js API server on port 3001"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start Node.js server in background' >> /start.sh && \
    echo 'cd /app && NODE_ENV=production node server/index.js &' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start Nginx in foreground' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start services
CMD ["/start.sh"]
