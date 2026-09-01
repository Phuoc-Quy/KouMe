import type { Request, Response } from 'express';

import { meService, MeServiceError } from './me.service.js';

const handleMeError = (error: unknown, res: Response): void => {
  if (error instanceof MeServiceError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        res.status(401).json({
          error: error.code,
          message: error.message,
        });
        return;
      case 'USER_NOT_FOUND':
        res.status(404).json({
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

export const meController = {
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      if (!token) {
        res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Access token is required',
        });
        return;
      }

      const user = await meService.getMe(token);

      res.status(200).json(user);
    } catch (error) {
      handleMeError(error, res);
    }
  },
};
