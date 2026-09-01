import { Router } from 'express';

import { forgotPasswordRouter } from './forgot-password/forgot-password.route.js';
import { logInRouter } from './log-in/log-in.route.js';
import { logOutRouter } from './log-out/log-out.route.js';
import { refreshTokenRouter } from './refresh-token/refresh-token.route.js';
import { signUpRouter } from './sign-up/sign-up.route.js';

export const authRouter = Router();

authRouter.use('/sign-up', signUpRouter);
authRouter.use('/log-in', logInRouter);
authRouter.use('/forgot-password', forgotPasswordRouter);
authRouter.use('/log-out', logOutRouter);
authRouter.use('/refresh-token', refreshTokenRouter);
