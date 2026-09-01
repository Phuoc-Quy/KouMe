import { Router } from 'express';

import { logOutController } from './log-out.controller.js';

export const logOutRouter = Router();

logOutRouter.post('/', logOutController.logOut);
