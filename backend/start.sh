#!/bin/sh
set -e

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔧 Setting up database..."

# Run migrations with detailed output
echo "📦 Applying database migrations..."
if npx prisma migrate deploy --schema=./prisma/schema.prisma; then
  echo "✅ Migrations applied successfully"
else
  echo "⚠️  Migration deploy failed, attempting db push..."
  if npx prisma db push --accept-data-loss --skip-generate --schema=./prisma/schema.prisma; then
    echo "✅ Database schema pushed successfully"
  else
    echo "❌ Database setup failed!"
    echo "📋 Current database status:"
    npx prisma migrate status || true
    exit 1
  fi
fi

echo "🔍 Verifying database schema..."
npx prisma migrate status || echo "⚠️  Could not verify migration status"

echo "🚀 Starting server..."
node dist/server.js
