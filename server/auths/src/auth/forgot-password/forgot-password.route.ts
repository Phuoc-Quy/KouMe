import { Router } from 'express';

import { forgotPasswordController } from './forgot-password.controller.js';

export const forgotPasswordRouter = Router();

forgotPasswordRouter.post('/request', forgotPasswordController.request);

forgotPasswordRouter.post('/verify-otp', forgotPasswordController.verifyOtp);

forgotPasswordRouter.post('/reset', forgotPasswordController.reset);
