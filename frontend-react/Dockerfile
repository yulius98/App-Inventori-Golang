# Build stage
FROM node:22-alpine AS builder

# Update packages for security patches
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code and env files
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

# Update packages for security patches
RUN apk update && apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
