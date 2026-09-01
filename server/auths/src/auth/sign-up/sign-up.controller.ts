import type { Request, Response } from 'express';

import { signUpService, SignUpServiceError } from './sign-up.service.js';

import { isValidOtp } from '@server/shared/utils/otp.js';

import type { SignUpCreateInput } from './sign-up.type.js';

const handleSignUpError = (error: unknown, res: Response): void => {
  if (error instanceof SignUpServiceError) {
    switch (error.code) {
      case 'EMAIL_REGISTERED':
      case 'USERNAME_TAKEN':
        res.status(409).json({
          error: error.code,
          message: error.message,
        });
        return;

      case 'INVALID_USERNAME':
      case 'INVALID_PASSWORD':
        res.status(400).json({
          error: error.code,
          message: error.message,
        });
        return;

      case 'INVALID_OTP':
      case 'OTP_NOT_FOUND':
        res.status(400).json({
          error: error.code,
          message: error.message,
        });
        return;

      case 'TOO_MANY_OTP_ATTEMPTS':
        res.status(429).json({
          error: error.code,
          message: error.message,
        });
        return;

      case 'INVALID_SIGNUP_TOKEN':
        res.status(401).json({
          error: error.code,
          message: error.message,
        });
        return;
    }
  }

  console.error(error);

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};

const getRequiredString = (body: unknown, field: string): string | null => {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const value = (body as Record<string, unknown>)[field];

  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  return value;
};

const sendInvalidRequest = (res: Response, message: string): void => {
  res.status(400).json({
    error: 'INVALID_REQUEST',
    message,
  });
};

export const signUpController = {
  async request(req: Request, res: Response): Promise<void> {
    try {
      const email = getRequiredString(req.body, 'email');

      if (!email) {
        sendInvalidRequest(res, 'Email is required');
        return;
      }

      await signUpService.request(email);

      res.status(200).json({
        message: 'Verification code sent',
      });
    } catch (error) {
      handleSignUpError(error, res);
    }
  },

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const email = getRequiredString(req.body, 'email');
      const otp = getRequiredString(req.body, 'otp');

      if (!email || !otp || !isValidOtp(otp)) {
        sendInvalidRequest(res, 'Email and a 6-character OTP are required');
        return;
      }

      const signupToken = await signUpService.verify(email, otp);

      res.status(200).json({
        signupToken,
      });
    } catch (error) {
      handleSignUpError(error, res);
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const signupToken = getRequiredString(req.body, 'signupToken');
      const username = getRequiredString(req.body, 'username');
      const password = getRequiredString(req.body, 'password');

      if (!signupToken || !username || !password) {
        sendInvalidRequest(
          res,
          'Signup token, username, and password are required',
        );
        return;
      }

      const input: SignUpCreateInput = {
        signupToken,
        username,
        password,
      };

      const user = await signUpService.create(input);

      res.status(201).json({
        user,
      });
    } catch (error) {
      handleSignUpError(error, res);
    }
  },
};
