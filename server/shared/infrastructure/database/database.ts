import { Pool } from 'pg';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  pool = new Pool({ connectionString });

  return pool;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
};
