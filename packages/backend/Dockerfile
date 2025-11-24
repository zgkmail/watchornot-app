# Use Node.js 20 Alpine for smaller image size (required by lru-cache@11)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Create database directory for persistent storage
RUN mkdir -p /data

# Expose port (Fly.io will set PORT env var)
EXPOSE 8080

# Set PORT and NODE_ENV environment variables explicitly for Fly.io
ENV PORT=8080
ENV NODE_ENV=production

# Health check - using the PORT env var
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://0.0.0.0:' + (process.env.PORT || 8080) + '/health', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

# Start the server
CMD ["node", "server.js"]
