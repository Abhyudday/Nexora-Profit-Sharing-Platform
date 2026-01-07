import { Router } from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword, resendVerificationEmail } from '../controllers/auth.controller';
import { 
  loginLimiter, 
  registerLimiter, 
  passwordResetLimiter,
  authLimiter 
} from '../middleware/rate-limit.middleware';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
} from '../middleware/validation.middleware';

const router = Router();

// Registration with rate limiting and validation
router.post('/register', registerLimiter, validateRegister, register);

// Email verification
router.post('/verify-email', authLimiter, validateVerifyEmail, verifyEmail);

// Resend verification email
router.post('/resend-verification', authLimiter, validateForgotPassword, resendVerificationEmail);

// Login with strict rate limiting and validation
router.post('/login', loginLimiter, validateLogin, login);

// Password reset with rate limiting
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);

export default router;
