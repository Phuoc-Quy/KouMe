import {
  signUpRepository,
  SignUpRepositoryConflictError,
} from './sign-up.repository.js';

import { signUpOtpStore } from './store/sign-up-otp.store.js';
import { signUpTokenStore } from './store/sign-up-token.store.js';

import { generateOtp, hashOtp, verifyOtp } from '@server/shared/utils/otp.js';

import { generateToken, hashToken } from '@server/shared/utils/token.js';

import {
  hashPassword,
  isValidPassword,
} from '@server/shared/utils/password.js';

import { normalizeEmail, sendOtpMail } from '@server/shared/utils/mail.js';

import type {
  SignUpCreateInput,
  SignUpErrorCode,
  SignUpUser,
} from './sign-up.type.js';

const MAX_OTP_ATTEMPTS = 5;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,}$/;

export class SignUpServiceError extends Error {
  constructor(
    public readonly code: SignUpErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'SignUpServiceError';
  }
}

export const signUpService = {
  async request(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);

    const emailExists = await signUpRepository.findByEmail(normalizedEmail);

    if (emailExists) {
      throw new SignUpServiceError(
        'EMAIL_REGISTERED',
        'Email already registered',
      );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await signUpOtpStore.create(normalizedEmail, otpHash);

    try {
      await sendOtpMail(normalizedEmail, otp);
    } catch (error) {
      await signUpOtpStore.delete(normalizedEmail);

      throw error;
    }
  },

  async verify(email: string, otp: string): Promise<string> {
    const normalizedEmail = normalizeEmail(email);

    const state = await signUpOtpStore.get(normalizedEmail);

    if (!state) {
      throw new SignUpServiceError('OTP_NOT_FOUND', 'OTP expired or not found');
    }

    if (state.attempts >= MAX_OTP_ATTEMPTS) {
      await signUpOtpStore.delete(normalizedEmail);

      throw new SignUpServiceError(
        'TOO_MANY_OTP_ATTEMPTS',
        'Too many OTP attempts',
      );
    }

    const isValid = verifyOtp(otp, state.otpHash);

    if (!isValid) {
      const attempts = await signUpOtpStore.incrementAttempts(normalizedEmail);

      if (attempts !== null && attempts >= MAX_OTP_ATTEMPTS) {
        await signUpOtpStore.delete(normalizedEmail);

        throw new SignUpServiceError(
          'TOO_MANY_OTP_ATTEMPTS',
          'Too many OTP attempts',
        );
      }

      throw new SignUpServiceError('INVALID_OTP', 'Invalid OTP');
    }

    const consumed = await signUpOtpStore.consume(normalizedEmail);

    if (!consumed) {
      throw new SignUpServiceError('OTP_NOT_FOUND', 'OTP expired or not found');
    }

    const signUpToken = generateToken();
    const tokenHash = hashToken(signUpToken);

    await signUpTokenStore.create(tokenHash, normalizedEmail);

    return signUpToken;
  },

  async create(input: SignUpCreateInput): Promise<SignUpUser> {
    if (!USERNAME_PATTERN.test(input.username)) {
      throw new SignUpServiceError(
        'INVALID_USERNAME',
        'Username must be at least 3 characters and contain only lowercase letters, numbers, hyphens, periods, and underscores',
      );
    }

    if (!isValidPassword(input.password)) {
      throw new SignUpServiceError(
        'INVALID_PASSWORD',
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      );
    }

    const tokenHash = hashToken(input.signupToken);

    const signUpState = await signUpTokenStore.get(tokenHash);

    if (!signUpState) {
      throw new SignUpServiceError(
        'INVALID_SIGNUP_TOKEN',
        'Invalid or expired signup token',
      );
    }

    const email = normalizeEmail(signUpState.email);
    const username = input.username.trim().toLowerCase();

    const emailExists = await signUpRepository.findByEmail(email);

    if (emailExists) {
      throw new SignUpServiceError(
        'EMAIL_REGISTERED',
        'Email already registered',
      );
    }

    const usernameExists = await signUpRepository.findByUsername(username);

    if (usernameExists) {
      throw new SignUpServiceError('USERNAME_TAKEN', 'Username already taken');
    }

    const passwordHash = await hashPassword(input.password);

    try {
      const user = await signUpRepository.createUser({
        email,
        username,
        passwordHash,
      });

      await signUpTokenStore.delete(tokenHash);

      return user;
    } catch (error) {
      if (error instanceof SignUpRepositoryConflictError) {
        if (error.field === 'email') {
          throw new SignUpServiceError(
            'EMAIL_REGISTERED',
            'Email already registered',
          );
        }

        throw new SignUpServiceError(
          'USERNAME_TAKEN',
          'Username already taken',
        );
      }

      throw error;
    }
  },
};
