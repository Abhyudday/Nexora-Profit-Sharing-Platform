import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.util';
import { generateReferralCode, generateVerificationToken } from '../utils/helpers';
import prisma from '../utils/prisma';
import { logSecurityEvent } from '../middleware/security.middleware';

// Validate JWT_SECRET exists and is secure
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters long');
  }
  if (secret.includes('default') || secret.includes('change')) {
    console.error('⚠️ WARNING: JWT_SECRET appears to be a default value. Please change it for production!');
  }
  return secret;
};

export const register = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Registration attempt started');
    console.log('📝 Request body:', { ...req.body, password: '[HIDDEN]' });
    
    const { username, email, phone, password, referralCode } = req.body;

    // Validate required fields
    if (!username || !email || !phone || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    console.log('🔍 Checking if user exists...');
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    console.log('👤 Existing user check result:', existingUser ? 'User exists' : 'User does not exist');

    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Find referrer if referral code provided
    let referrerId = null;
    if (referralCode) {
      console.log('🔍 Checking referral code:', referralCode);
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (!referrer) {
        console.log('❌ Invalid referral code');
        return res.status(400).json({ error: 'Invalid referral code' });
      }
      referrerId = referrer.id;
      console.log('✅ Valid referrer found:', referrer.username);
    }

    console.log('🔒 Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🎲 Generating unique referral code...');
    // Generate unique referral code
    let newReferralCode = generateReferralCode();
    let codeExists = await prisma.user.findUnique({
      where: { referralCode: newReferralCode },
    });
    while (codeExists) {
      newReferralCode = generateReferralCode();
      codeExists = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
    }
    console.log('✅ Generated referral code:', newReferralCode);

    console.log('💾 Creating user in database...');
    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Create user with email unverified
    const user = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashedPassword,
        referralCode: newReferralCode,
        referrerId,
        emailVerified: false,
        verificationToken,
      },
    });
    console.log('✅ User created successfully with ID:', user.id);

    // Send verification email immediately
    console.log('📧 Sending verification email...');
    let emailSent = false;
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('✅ Verification email sent successfully');
      emailSent = true;
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError);
      // Don't fail registration if email fails - user can request resend
    }

    console.log('🎉 Registration completed successfully');
    res.status(201).json({
      message: emailSent 
        ? 'Registration successful! Please check your email to verify your account before logging in.'
        : 'Registration successful! However, we could not send the verification email. Please use the "Resend Verification Email" option.',
      userId: user.id,
      emailSent,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid referral code' });
    }
    if (error.message?.includes('connect')) {
      return res.status(500).json({ error: 'Database connection failed. Please try again.' });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 Login attempt started');
    console.log('📧 Email:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Looking up user in database...');
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        level: true,
        isAdmin: true,
        emailVerified: true,
      },
    });
    console.log('👤 User lookup result:', user ? `Found user: ${user.username}` : 'User not found');

    if (!user) {
      console.log('❌ User not found - please sign up first');
      return res.status(401).json({ error: 'Invalid credentials. Please sign up first.' });
    }

    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password check result:', isPasswordValid ? 'Valid' : 'Invalid');

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check email verification
    if (!user.emailVerified) {
      console.log('❌ Email not verified');
      return res.status(403).json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailNotVerified: true,
        email: user.email
      });
    }

    const jwtSecret = getJwtSecret();
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Log successful login
    logSecurityEvent('LOGIN_SUCCESS', req, { userId: user.id, email: user.email });

    console.log('✅ Login successful - generating token');
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error: any) {
    // Log failed login attempt with details
    logSecurityEvent('LOGIN_FAILED', req, { email: req.body.email, error: 'Internal error' });
    console.error('❌ Login error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken);

      res.json({ message: 'If the email exists, a password reset link has been sent' });
    } catch (dbError: any) {
      // Check if it's a column not found error
      if (dbError.code === 'P2022' && dbError.message?.includes('resetToken')) {
        console.error('Database schema outdated - resetToken columns missing. Run migrations!');
        return res.status(503).json({ 
          error: 'Password reset is temporarily unavailable. Please contact support or try again later.' 
        });
      }
      throw dbError; // Re-throw if it's a different error
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: 'If the email exists and is not verified, a new verification link has been sent.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified. You can login now.' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (dbError: any) {
      // Check if it's a column not found error
      if (dbError.code === 'P2022' && dbError.message?.includes('resetToken')) {
        console.error('Database schema outdated - resetToken columns missing. Run migrations!');
        return res.status(503).json({ 
          error: 'Password reset is temporarily unavailable. Please contact support or try again later.' 
        });
      }
      throw dbError; // Re-throw if it's a different error
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
