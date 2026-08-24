import { Pool } from 'pg';

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL has not been loaded');
  }

  return databaseUrl;
}

export function createDatabasePool(): Pool {
  return new Pool({
    connectionString: getDatabaseUrl(),
    allowExitOnIdle: true,
  });
}

export async function connectDatabase(): Promise<Pool> {
  const pool = createDatabasePool();

  try {
    await pool.query('SELECT 1');
    return pool;
  } catch (error) {
    await pool.end();

    const message =
      error instanceof Error ? error.message : 'Unknown connection error';

    throw new Error(`Unable to connect to database: ${message}`);
  }
}

export async function closeDatabase(pool: Pool): Promise<void> {
  await pool.end();
}

export async function connectDb<T>(
  callback: (pool: Pool) => Promise<T>,
): Promise<T> {
  const pool = await connectDatabase();

  try {
    return await callback(pool);
  } finally {
    await closeDatabase(pool);
  }
}
