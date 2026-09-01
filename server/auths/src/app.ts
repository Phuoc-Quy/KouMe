import express, { type Express } from 'express';

import { authRouter } from './auth/auth.route.js';

export function getApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.use('/auth', authRouter);

  return app;
}
