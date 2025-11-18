-- AlterTable
ALTER TABLE "BonusHistory" ADD COLUMN IF NOT EXISTS "tradingDate" TIMESTAMP(3);
ALTER TABLE "BonusHistory" ADD COLUMN IF NOT EXISTS "bonusDetails" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BonusHistory_tradingDate_idx" ON "BonusHistory"("tradingDate");
