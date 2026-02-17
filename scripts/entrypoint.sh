#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
if [ -f "./node_modules/.bin/prisma" ]; then
    echo "✅ Prisma binary found at ./node_modules/.bin/prisma"
    ./node_modules/.bin/prisma migrate deploy || { echo "❌ Prisma migration failed!"; exit 1; }
else
    echo "⚠️ Prisma binary not found in expected location, trying npx..."
    npx prisma migrate deploy || { echo "❌ Prisma migration failed via npx!"; exit 1; }
fi

echo "🚀 Starting Next.js server..."
exec node server.js
