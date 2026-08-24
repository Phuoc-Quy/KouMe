import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureMigrationTable,
  getMigrationFiles,
  validateMigrationFiles,
} from '../lib/migration.js';
import { transaction } from '../lib/transaction.js';
import { logger } from '../templates/logger.js';
import type { Environment } from '../types/environment.js';
import { assertEnvironmentAllowed } from '../utils/assertEnvironmentAllowed.js';
import { connectDb } from '../utils/connectDb.js';

const RESET_ENVIRONMENTS: readonly Environment[] = [
  'development',
  'test',
  'custom',
];

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, '../../workingDir/migrations');

export async function reset(): Promise<void> {
  assertEnvironmentAllowed('Reset', RESET_ENVIRONMENTS);

  await connectDb(async (pool) => {
    logger.info('Connected to database');

    const migrations = await getMigrationFiles(migrationsDirectory);

    validateMigrationFiles(migrations, []);
    logger.warning('Resetting database');

    await transaction(pool, async (client) => {
      await client.query(`
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
      `);

      await ensureMigrationTable(client);

      for (const migration of migrations) {
        await client.query(migration.sql);
        await client.query(
          `
            INSERT INTO schema_migrations (
              version,
              name,
              checksum
            )
            VALUES ($1, $2, $3);
          `,
          [migration.version, migration.name, migration.checksum],
        );
      }
    });

    for (const migration of migrations) {
      logger.success(`Applied ${migration.filename}`);
    }

    logger.success('Database reset and migrated successfully');
  });
}
