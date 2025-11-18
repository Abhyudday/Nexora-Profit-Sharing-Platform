#!/bin/bash
# Script to resolve failed migration on Railway

echo "Resolving failed migration..."
npx prisma migrate resolve --rolled-back 20251119000000_add_bonus_history_fields

echo "Applying migrations..."
npx prisma migrate deploy

echo "Done!"
