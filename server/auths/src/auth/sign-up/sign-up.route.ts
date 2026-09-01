import { Router } from 'express';

import { signUpController } from './sign-up.controller.js';

export const signUpRouter = Router();

signUpRouter.post('/request', signUpController.request);

signUpRouter.post('/verify-otp', signUpController.verifyOtp);

signUpRouter.post('/create', signUpController.create);
