import 'dotenv/config';

import { getOptionalEnv } from '@server/shared/config/env.js';
import { getApp } from './app.js';

const app = getApp();
const port = Number(getOptionalEnv('PORT', '3001'));

const start = async (): Promise<void> => {
  app.listen(port, () => {
    console.log(`Users server is running on port ${port}`);
  });
};

start().catch((error: unknown) => {
  console.error('Failed to start users server', error);
  process.exit(1);
});
