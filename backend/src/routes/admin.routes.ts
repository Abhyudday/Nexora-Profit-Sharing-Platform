import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getPendingDeposits,
  getPendingWithdrawals,
  approveDeposit,
  approveWithdrawal,
  rejectTransaction,
  inputTradingResult,
  distributeProfit,
  distributeBonus,
  getAllUsers,
  getAdminStats,
  exportWithdrawals,
  getRankingLevels,
  updateRankingLevel,
  getMemberNetworkTree,
  getMemberDetails,
  adjustUserBalance,
  getRecentTransactions,
  recalculateAllRanks,
} from '../controllers/admin.controller';
import { adminActionLimiter } from '../middleware/rate-limit.middleware';
import {
  validateTransactionId,
  validateUserId,
  validateTradingResult,
  validateBalanceAdjustment,
  validateRejectTransaction,
  validatePagination,
  validateSearch,
} from '../middleware/validation.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Apply rate limiting to all admin routes
router.use(adminActionLimiter);

// Read operations with pagination/search validation
router.get('/stats', getAdminStats);
router.get('/users', validatePagination, validateSearch, getAllUsers);
router.get('/deposits/pending', getPendingDeposits);
router.get('/withdrawals/pending', getPendingWithdrawals);
router.get('/withdrawals/export', exportWithdrawals);
router.get('/ranking-levels', getRankingLevels);
router.get('/member/:userId/network-tree', validateUserId, getMemberNetworkTree);
router.get('/member/:userId/details', validateUserId, getMemberDetails);
router.get('/transactions/recent', validatePagination, getRecentTransactions);

// Write operations with validation
router.post('/deposits/:transactionId/approve', validateTransactionId, approveDeposit);
router.post('/withdrawals/:transactionId/approve', validateTransactionId, approveWithdrawal);
router.post('/transactions/:transactionId/reject', validateRejectTransaction, rejectTransaction);
router.post('/trading-result', validateTradingResult, inputTradingResult);
router.post('/trading-result/:tradingResultId/distribute', distributeProfit);
router.post('/bonus/:userId/distribute', validateUserId, distributeBonus);
router.post('/ranking-level', updateRankingLevel);
router.post('/user/:userId/adjust-balance', validateBalanceAdjustment, adjustUserBalance);
router.post('/recalculate-ranks', recalculateAllRanks);

export default router;
