import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createDeposit,
  createWithdrawal,
  getMyTransactions,
} from '../controllers/transaction.controller';
import { transactionLimiter } from '../middleware/rate-limit.middleware';
import { 
  validateDeposit, 
  validateWithdrawal,
  validatePagination 
} from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

// Deposit with rate limiting and validation
router.post('/deposit', transactionLimiter, validateDeposit, createDeposit);

// Withdrawal with rate limiting and validation
router.post('/withdrawal', transactionLimiter, validateWithdrawal, createWithdrawal);

// Get transactions with pagination validation
router.get('/my-transactions', validatePagination, getMyTransactions);

export default router;
