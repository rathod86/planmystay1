# Build stage (optional: use if you need build step)
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only for smaller image)
RUN npm ci --omit=dev

# Copy application source
COPY . .

# OpenShift runs as non-root; use port 8080 (OpenShift default)
ENV PORT=8080
EXPOSE 8080

# Run as non-root user (OpenShift requirement)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

CMD ["node", "app.js"]
