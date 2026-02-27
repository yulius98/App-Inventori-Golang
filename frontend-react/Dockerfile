# =========================
# 1️⃣ Build Stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package.json package-lock.json ./

# Install dependencies (deterministic)
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build production assets
RUN npm run build


# =========================
# 2️⃣ Production Stage
# =========================
FROM nginx:1.27-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]