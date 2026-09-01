import { Router } from 'express';

import { meRouter } from './me/me.route.js';

export const userRouter = Router();

userRouter.use('/', meRouter);
