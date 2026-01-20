import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email sender address (must be verified in Resend or use onboarding@resend.dev for testing)
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Get the primary frontend URL (first one if comma-separated)
const getFrontendUrl = (): string => {
  const urls = process.env.FRONTEND_URL || 'http://localhost:3000';
  return urls.split(',')[0].trim();
};

export const sendVerificationEmail = async (email: string, token: string) => {
  if (!resend) {
    const errorMsg = '⚠️  Resend not configured (RESEND_API_KEY missing)';
    console.error(errorMsg);
    throw new Error('Email service not configured. Please contact support.');
  }

  const verificationUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Email - SkyEast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SkyEast - The Next Organization!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
    
    console.log('✅ Verification email sent:', data?.id);
  } catch (err) {
    console.error('❌ Error sending verification email:', err);
    throw err;
  }
};

export const sendDepositApprovedEmail = async (
  email: string,
  amount: number
) => {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping deposit approval email to', email);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Deposit Approved - SkyEast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Deposit Approved!</h2>
          <p>Your deposit of <strong>${amount} USDT</strong> has been approved and added to your account.</p>
          <p>You can now view your updated balance in your dashboard.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Failed to send deposit approval email:', error);
      throw error;
    }
    
    console.log('✅ Deposit approval email sent:', data?.id);
  } catch (err) {
    console.error('❌ Error sending deposit approval email:', err);
    throw err;
  }
};

export const sendWithdrawalApprovedEmail = async (
  email: string,
  amount: number
) => {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping withdrawal approval email to', email);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Withdrawal Approved - SkyEast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Withdrawal Processed!</h2>
          <p>Your withdrawal request of <strong>${amount} USDT</strong> has been approved.</p>
          <p>The funds will be sent to your wallet shortly.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Failed to send withdrawal approval email:', error);
      throw error;
    }
    
    console.log('✅ Withdrawal approval email sent:', data?.id);
  } catch (err) {
    console.error('❌ Error sending withdrawal approval email:', err);
    throw err;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping password reset email to', email);
    console.warn('📝 Password reset token:', token);
    return;
  }

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Password Reset - SkyEast',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
    
    console.log('✅ Password reset email sent:', data?.id);
  } catch (err) {
    console.error('❌ Error sending password reset email:', err);
    throw err;
  }
};
