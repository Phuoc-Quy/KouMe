import express, { type Express } from 'express';

import { userRouter } from './user/user.route.js';

export function getApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.use('/user', userRouter);

  return app;
}
