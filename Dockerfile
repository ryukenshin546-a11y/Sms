# Multi-stage build for SMS System
FROM node:18-alpine as frontend-build

# Set working directory for frontend
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY bun.lockb ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build frontend
RUN npm run build

# Backend stage
FROM node:18-alpine as backend-build

# Set working directory for backend
WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY server/ ./

# Production stage
FROM node:18-alpine as production

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Create app directory
WORKDIR /app

# Copy built frontend from build stage
COPY --from=frontend-build /app/dist ./dist

# Copy backend application
COPY --from=backend-build /app/server ./server

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start both frontend serve and backend server
CMD ["sh", "-c", "cd /app/server && npm start"]
