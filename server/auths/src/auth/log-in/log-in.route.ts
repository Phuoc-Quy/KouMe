import { Router } from 'express';

import { logInController } from './log-in.controller.js';

export const logInRouter = Router();

logInRouter.post('/', logInController.logIn);
