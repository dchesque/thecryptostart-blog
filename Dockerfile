# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Declare ARGs for build-time environment variables
ARG NEXT_PUBLIC_SITE_URL

# Set them as ENV for the build process
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies needed for Prisma and runtime on Alpine
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Install prisma CLI with all its dependencies for migrations
RUN npm install prisma@6.19.2 --legacy-peer-deps --no-save

# Set correct permissions
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app
RUN chmod +x /app/scripts/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Execute migrations before starting
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
