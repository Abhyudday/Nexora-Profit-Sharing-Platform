-- Truncate all tables in the correct order to handle foreign key constraints
-- This will delete all data but keep the table structure intact

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = 'replica';

-- Truncate tables in order (child tables first, then parent tables)
TRUNCATE TABLE "AdminAction" CASCADE;
TRUNCATE TABLE "SystemConfig" CASCADE;
TRUNCATE TABLE "TradingResult" CASCADE;
TRUNCATE TABLE "BonusHistory" CASCADE;
TRUNCATE TABLE "ProfitHistory" CASCADE;
TRUNCATE TABLE "NetworkNode" CASCADE;
TRUNCATE TABLE "Transaction" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify tables are empty
SELECT 'AdminAction' as table_name, COUNT(*) as row_count FROM "AdminAction"
UNION ALL
SELECT 'SystemConfig', COUNT(*) FROM "SystemConfig"
UNION ALL
SELECT 'TradingResult', COUNT(*) FROM "TradingResult"
UNION ALL
SELECT 'BonusHistory', COUNT(*) FROM "BonusHistory"
UNION ALL
SELECT 'ProfitHistory', COUNT(*) FROM "ProfitHistory"
UNION ALL
SELECT 'NetworkNode', COUNT(*) FROM "NetworkNode"
UNION ALL
SELECT 'Transaction', COUNT(*) FROM "Transaction"
UNION ALL
SELECT 'User', COUNT(*) FROM "User";
