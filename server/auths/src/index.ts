import 'dotenv/config';
import { startSessionCleanupJob } from './jobs/session-cleanup.js';

import { getOptionalEnv } from '@server/shared/config/env.js';
import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';
import { getRedisClient } from '@server/shared/infrastructure/redis/redis.js';
import { getApp } from './app.js';

const app = getApp();
const port = Number(getOptionalEnv('PORT', '3000'));

const start = async (): Promise<void> => {
  await getDatabasePool().query('SELECT 1');
  await getRedisClient();

  startSessionCleanupJob();

  app.listen(port, () => {
    console.log(`Auths server is running on port ${port}`);
  });
};

start().catch((error: unknown) => {
  console.error('Failed to start auths server', error);
  process.exit(1);
});
