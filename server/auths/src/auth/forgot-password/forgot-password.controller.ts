import type { Request, Response } from 'express';

import {
  forgotPasswordService,
  ForgotPasswordServiceError,
} from './forgot-password.service.js';

import { isValidOtp } from '@server/shared/utils/otp.js';

import type { ForgotPasswordResetInput } from './forgot-password.type.js';

const handleForgotPasswordError = (error: unknown, res: Response): void => {
  if (error instanceof ForgotPasswordServiceError) {
    switch (error.code) {
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

      case 'INVALID_RESET_TOKEN':
        res.status(401).json({
          error: error.code,
          message: error.message,
        });
        return;

      case 'INVALID_PASSWORD':
        res.status(400).json({
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

export const forgotPasswordController = {
  async request(req: Request, res: Response): Promise<void> {
    try {
      const email = getRequiredString(req.body, 'email');

      if (!email) {
        sendInvalidRequest(res, 'Email is required');
        return;
      }

      await forgotPasswordService.request(email);

      res.status(200).json({
        message: 'If the account exists, a verification code has been sent',
      });
    } catch (error) {
      handleForgotPasswordError(error, res);
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

      const resetToken = await forgotPasswordService.verify(email, otp);

      res.status(200).json({
        resetToken,
      });
    } catch (error) {
      handleForgotPasswordError(error, res);
    }
  },

  async reset(req: Request, res: Response): Promise<void> {
    try {
      const resetToken = getRequiredString(req.body, 'resetToken');
      const password = getRequiredString(req.body, 'password');

      if (!resetToken || !password) {
        sendInvalidRequest(res, 'Reset token and password are required');
        return;
      }

      const input: ForgotPasswordResetInput = {
        resetToken,
        password,
      };

      await forgotPasswordService.reset(input);

      res.sendStatus(204);
    } catch (error) {
      handleForgotPasswordError(error, res);
    }
  },
};
