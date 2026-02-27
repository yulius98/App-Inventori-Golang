# =========================
# 1️⃣ Build Stage
# =========================
FROM golang:1.25-alpine AS builder

# Install git only if needed for private modules
RUN apk add --no-cache git

WORKDIR /app

# Copy dependency files first (for caching)
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o app .

# =========================
# 2️⃣ Runtime Stage
# =========================
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/app .

# Use non-root user (security best practice)
USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/app"]