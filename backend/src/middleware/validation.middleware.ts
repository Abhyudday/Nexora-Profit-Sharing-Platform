import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors with detailed messages
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
      value: err.type === 'field' ? err.value : undefined
    }));

    // Log validation errors for debugging
    console.error('❌ Validation failed:', {
      path: req.path,
      method: req.method,
      errors: errorMessages,
      body: { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined }
    });

    // Return user-friendly error with specific field issues
    const firstError = errorMessages[0];
    return res.status(400).json({ 
      error: firstError.message,
      field: firstError.field,
      validationErrors: errorMessages
    });
  }
  next();
};

// === AUTH VALIDATIONS ===

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  body('phone')
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters')
    .matches(/^[+]?[0-9\s-]+$/)
    .withMessage('Phone number can only contain digits, spaces, dashes, and optional + prefix'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('referralCode')
    .optional()
    .trim()
    .isLength({ min: 8, max: 8 })
    .withMessage('Referral code must be exactly 8 characters')
    .isAlphanumeric()
    .withMessage('Referral code must be alphanumeric'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors,
];

export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid reset token format'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors,
];

export const validateVerifyEmail = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Verification token is required'),
  handleValidationErrors,
];

// === TRANSACTION VALIDATIONS ===

export const validateDeposit = [
  body('amount')
    .isFloat({ min: 0.001 })
    .withMessage('Amount must be a positive number'),
  body('walletAddress')
    .trim()
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Invalid wallet address length'),
  body('txHash')
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Invalid transaction hash length'),
  handleValidationErrors,
];

export const validateWithdrawal = [
  body('amount')
    .isFloat({ min: 10 })
    .withMessage('Minimum withdrawal amount is $10'),
  body('walletAddress')
    .trim()
    .notEmpty()
    .withMessage('Wallet address is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Invalid wallet address length'),
  handleValidationErrors,
];

// === ADMIN VALIDATIONS ===

export const validateTransactionId = [
  param('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isLength({ min: 20, max: 30 })
    .withMessage('Invalid transaction ID format'),
  handleValidationErrors,
];

export const validateUserId = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 20, max: 30 })
    .withMessage('Invalid user ID format'),
  handleValidationErrors,
];

export const validateTradingResult = [
  body('profitPercent')
    .isFloat({ min: -100, max: 100 })
    .withMessage('Profit percent must be between -100 and 100'),
  body('tradingDate')
    .isISO8601()
    .withMessage('Trading date must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .escape(),
  handleValidationErrors,
];

export const validateBalanceAdjustment = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('User ID is required'),
  body('amount')
    .isFloat()
    .withMessage('Amount must be a number'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
    .escape(),
  handleValidationErrors,
];

export const validateRejectTransaction = [
  param('transactionId')
    .trim()
    .notEmpty()
    .withMessage('Transaction ID is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
    .escape(),
  handleValidationErrors,
];

// === QUERY VALIDATIONS ===

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must not exceed 100 characters')
    .escape(),
  handleValidationErrors,
];
