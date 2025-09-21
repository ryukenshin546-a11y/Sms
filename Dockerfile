# Multi-stage build for production deployment
# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Accept build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG SUPABASE_CLIENT_API_KEY

# Set environment variables for Vite build (non-sensitive only)
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV NODE_ENV=production

# Build the application with environment variables inline
RUN VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-$SUPABASE_CLIENT_API_KEY} npm run build

# Verify build output exists
RUN ls -la /app/dist && test -f /app/dist/index.html

# Production stage with NGINX
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html && test -f /usr/share/nginx/html/index.html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create non-root user for security (check if exists first)
RUN getent group nginx || addgroup -g 1001 -S nginx
RUN getent passwd nginx || adduser -S nginx -u 1001 -G nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create pid directory
RUN mkdir -p /var/run && \
    chown -R nginx:nginx /var/run

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
