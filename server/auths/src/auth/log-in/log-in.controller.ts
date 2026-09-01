import type { Request, Response } from 'express';

import { logInService, LogInServiceError } from './log-in.service.js';

import type { LogInInput } from './log-in.type.js';

const handleLogInError = (error: unknown, res: Response): void => {
  if (error instanceof LogInServiceError) {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
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

export const logInController = {
  async logIn(req: Request, res: Response): Promise<void> {
    try {
      const identifier = getRequiredString(req.body, 'identifier');
      const password = getRequiredString(req.body, 'password');

      if (!identifier || !password) {
        sendInvalidRequest(res, 'Identifier and password are required');
        return;
      }

      const input: LogInInput = {
        identifier,
        password,
      };

      const result = await logInService.logIn(input);

      res.status(200).json(result);
    } catch (error) {
      handleLogInError(error, res);
    }
  },
};
