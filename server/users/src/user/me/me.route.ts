import { Router } from 'express';

import { meController } from './me.controller.js';

export const meRouter = Router();

meRouter.get('/me', meController.getMe);
