-- Add new fields to BonusHistory table
ALTER TABLE "BonusHistory" ADD COLUMN IF NOT EXISTS "tradingDate" TIMESTAMP(3);
ALTER TABLE "BonusHistory" ADD COLUMN IF NOT EXISTS "bonusDetails" TEXT;

-- Create index on tradingDate for faster queries
CREATE INDEX IF NOT EXISTS "BonusHistory_tradingDate_idx" ON "BonusHistory"("tradingDate");
