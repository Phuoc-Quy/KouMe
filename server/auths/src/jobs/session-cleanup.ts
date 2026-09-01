import cron from 'node-cron';
import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

export const startSessionCleanupJob = () => {
  cron.schedule('0 0 * * *', async () => {
    await getDatabasePool().query(`
      DELETE FROM sessions
      WHERE
        expires_at <= NOW()
        OR (
          revoked_at IS NOT NULL
          AND revoked_at + INTERVAL '7 days' <= NOW()
        );
    `);

    console.log('Session cleanup finished');
  });
};
