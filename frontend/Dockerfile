# ==============================================================================
# Stage 1: Astro Static Site Generation (Build Stage)
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy all frontend files (including pre-built dist if present)
COPY . .

# If dist does not exist, install and build
RUN if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then npm install && npm run build; fi

# ==============================================================================
# Stage 2: Production Nginx Runtime
# ==============================================================================
FROM nginx:alpine AS runner

# Install curl for container health checks
RUN apk add --no-cache curl

# Create media directory mount point
RUN mkdir -p /data/media

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
