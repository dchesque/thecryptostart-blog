#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
# Using --schema if needed, but standard location is fine
npx prisma migrate deploy

echo "🚀 Starting Next.js server..."
exec node server.js
