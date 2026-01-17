#!/bin/bash

echo "🚀 Starting Nexora Backend..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "✅ Starting Node.js server..."
node dist/server.js
