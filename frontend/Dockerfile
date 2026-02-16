# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_API_GO_URL=http://localhost:8080/api
ARG VITE_API_PYTHON_URL=http://localhost:8000/api
ENV VITE_API_GO_URL=$VITE_API_GO_URL
ENV VITE_API_PYTHON_URL=$VITE_API_PYTHON_URL

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
