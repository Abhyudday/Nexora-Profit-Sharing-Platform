#!/bin/bash

echo "================================================"
echo "MLM Integration Setup Script"
echo "Withdrawal Logic & Rank System Integration"
echo "================================================"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the backend directory"
    echo "   cd backend && bash setup-integration.sh"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "Step 3: Pushing database schema changes..."
npx prisma db push

echo ""
echo "Step 4: Seeding level bonus configuration..."
npx ts-node src/scripts/seed-level-bonuses.ts

echo ""
echo "================================================"
echo "✅ Integration setup complete!"
echo "================================================"
echo ""
echo "Summary of changes:"
echo "  ✓ Database schema updated (BonusHistory table)"
echo "  ✓ Level bonus percentages configured"
echo "  ✓ Rank system configuration seeded"
echo ""
echo "What's new:"
echo "  1. Withdrawal time window: 06:01 AM - 12:00 PM GMT+7"
echo "  2. Minimum withdrawal: \$10"
echo "  3. Dynamic rank system based on current balance"
echo "  4. Configurable level bonuses (20%, 4%, 4%...)"
echo "  5. Profit sharing varies by rank (50%-80%)"
echo "  6. Wallet details visible in pending lists"
echo ""
echo "Next steps:"
echo "  1. Restart your backend server"
echo "  2. Test withdrawal time restrictions"
echo "  3. Test rank upgrades/downgrades"
echo "  4. Review INTEGRATION_GUIDE.md for details"
echo ""
echo "================================================"
