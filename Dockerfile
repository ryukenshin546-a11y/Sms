# SMS Auto-Bot System - Dockerfile for Easypanel
# Simplified single-stage build without Nginx

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --production

# Copy source files
COPY . .

# Build the React application
RUN npm run build

# Install serve to host static files
RUN npm install -g serve

# Create start script that runs both frontend and backend
RUN echo '#!/bin/sh' > start.sh && \
    echo 'echo "🚀 Starting SMS Auto-Bot System..."' >> start.sh && \
    echo 'echo "📱 Frontend: http://localhost:3000"' >> start.sh && \
    echo 'echo "🔧 Backend API: http://localhost:3001"' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start backend API server in background' >> start.sh && \
    echo 'cd /app && NODE_ENV=production node server/index.js &' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start frontend with serve (serving built files)' >> start.sh && \
    echo 'cd /app && serve -s dist -l 3000 --cors' >> start.sh && \
    chmod +x start.sh

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["./start.sh"]
