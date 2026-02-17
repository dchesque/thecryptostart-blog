#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
if [ -f "./node_modules/prisma/build/index.js" ]; then
    echo "✅ Prisma build found, running migrations..."
    node node_modules/prisma/build/index.js migrate deploy || { echo "❌ Prisma migration failed!"; exit 1; }
else
    echo "⚠️ Prisma build not found, attempting npx as fallback..."
    npx prisma migrate deploy || { echo "❌ Prisma migration failed via npx!"; exit 1; }
fi

echo "🚀 Starting Next.js server..."
exec node server.js
