import { forgotPasswordRepository } from './forgot-password.repository.js';

import { forgotPasswordOtpStore } from './store/forgot-password-otp.store.js';

import { forgotPasswordTokenStore } from './store/forgot-password-token.store.js';

import { generateOtp, hashOtp, verifyOtp } from '@server/shared/utils/otp.js';

import { generateToken, hashToken } from '@server/shared/utils/token.js';

import {
  hashPassword,
  isValidPassword,
} from '@server/shared/utils/password.js';

import { normalizeEmail, sendOtpMail } from '@server/shared/utils/mail.js';

import type {
  ForgotPasswordErrorCode,
  ForgotPasswordResetInput,
} from './forgot-password.type.js';

const MAX_OTP_ATTEMPTS = 5;

export class ForgotPasswordServiceError extends Error {
  constructor(
    public readonly code: ForgotPasswordErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'ForgotPasswordServiceError';
  }
}

export const forgotPasswordService = {
  async request(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);

    const user = await forgotPasswordRepository.findByEmail(normalizedEmail);

    if (!user) {
      return;
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await forgotPasswordOtpStore.create(normalizedEmail, otpHash);

    try {
      await sendOtpMail(normalizedEmail, otp);
    } catch (error) {
      await forgotPasswordOtpStore.delete(normalizedEmail);
      throw error;
    }
  },

  async verify(email: string, otp: string): Promise<string> {
    const normalizedEmail = normalizeEmail(email);

    const state = await forgotPasswordOtpStore.get(normalizedEmail);

    if (!state) {
      throw new ForgotPasswordServiceError(
        'OTP_NOT_FOUND',
        'OTP expired or not found',
      );
    }

    if (state.attempts >= MAX_OTP_ATTEMPTS) {
      await forgotPasswordOtpStore.delete(normalizedEmail);

      throw new ForgotPasswordServiceError(
        'TOO_MANY_OTP_ATTEMPTS',
        'Too many OTP attempts',
      );
    }

    const isValid = verifyOtp(otp, state.otpHash);

    if (!isValid) {
      const attempts =
        await forgotPasswordOtpStore.incrementAttempts(normalizedEmail);

      if (attempts !== null && attempts >= MAX_OTP_ATTEMPTS) {
        await forgotPasswordOtpStore.delete(normalizedEmail);

        throw new ForgotPasswordServiceError(
          'TOO_MANY_OTP_ATTEMPTS',
          'Too many OTP attempts',
        );
      }

      throw new ForgotPasswordServiceError('INVALID_OTP', 'Invalid OTP');
    }

    const user = await forgotPasswordRepository.findByEmail(normalizedEmail);

    if (!user) {
      await forgotPasswordOtpStore.delete(normalizedEmail);

      throw new ForgotPasswordServiceError(
        'OTP_NOT_FOUND',
        'OTP expired or not found',
      );
    }

    const consumed = await forgotPasswordOtpStore.consume(normalizedEmail);

    if (!consumed) {
      throw new ForgotPasswordServiceError(
        'OTP_NOT_FOUND',
        'OTP expired or not found',
      );
    }

    const resetToken = generateToken();
    const tokenHash = hashToken(resetToken);

    await forgotPasswordTokenStore.create(tokenHash, user.id);

    return resetToken;
  },

  async reset(input: ForgotPasswordResetInput): Promise<void> {
    if (!isValidPassword(input.password)) {
      throw new ForgotPasswordServiceError(
        'INVALID_PASSWORD',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      );
    }

    const tokenHash = hashToken(input.resetToken);

    const userId = await forgotPasswordTokenStore.consume(tokenHash);

    if (!userId) {
      throw new ForgotPasswordServiceError(
        'INVALID_RESET_TOKEN',
        'Invalid or expired reset token',
      );
    }

    const passwordHash = await hashPassword(input.password);

    const updated = await forgotPasswordRepository.resetPassword(
      userId,
      passwordHash,
    );

    if (!updated) {
      throw new ForgotPasswordServiceError(
        'INVALID_RESET_TOKEN',
        'Invalid or expired reset token',
      );
    }
  },
};
