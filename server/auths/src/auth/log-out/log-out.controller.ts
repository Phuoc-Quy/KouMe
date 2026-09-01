import type { Request, Response } from 'express';

import { logOutService, LogOutServiceError } from './log-out.service.js';

const handleLogOutError = (error: unknown, res: Response): void => {
  if (error instanceof LogOutServiceError) {
    switch (error.code) {
      case 'INVALID_REFRESH_TOKEN':
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

export const logOutController = {
  async logOut(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = getRequiredString(req.body, 'refreshToken');

      if (!refreshToken) {
        sendInvalidRequest(res, 'Refresh token is required');
        return;
      }

      await logOutService.logOut(refreshToken);

      res.sendStatus(204);
    } catch (error) {
      handleLogOutError(error, res);
    }
  },
};
