import { Router } from 'express';

import { refreshTokenController } from './refresh-token.controller.js';

export const refreshTokenRouter = Router();

refreshTokenRouter.post('/', refreshTokenController.refresh);
