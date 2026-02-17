#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
if [ -f "./node_modules/.bin/prisma" ] || [ -f "./node_modules/prisma/build/index.js" ]; then
    npx prisma migrate deploy || { echo "❌ Prisma migration failed!"; exit 1; }
else
    echo "⚠️ Prisma binary not found, skipping migrations or attempting npx..."
    npx prisma migrate deploy || { echo "❌ Prisma migration failed via npx!"; exit 1; }
fi

echo "🚀 Starting Next.js server..."
exec node server.js
