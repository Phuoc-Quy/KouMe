import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureMigrationTable,
  getAppliedMigrations,
  getMigrationFiles,
  getPendingMigrations,
  validateMigrationFiles,
} from '../lib/migration.js';
import { transaction } from '../lib/transaction.js';
import { logger } from '../templates/logger.js';
import { ENVIRONMENTS } from '../types/environment.js';
import { assertEnvironmentAllowed } from '../utils/assertEnvironmentAllowed.js';
import { connectDb } from '../utils/connectDb.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, '../../workingDir/migrations');

export async function migrate(): Promise<void> {
  assertEnvironmentAllowed('Migrate', ENVIRONMENTS);

  await connectDb(async (pool) => {
    logger.info('Connected to database');

    const migrations = await getMigrationFiles(migrationsDirectory);
    const appliedMigrations = await transaction(pool, async (client) => {
      await ensureMigrationTable(client);
      return getAppliedMigrations(client);
    });

    validateMigrationFiles(migrations, appliedMigrations);

    const pendingMigrations = getPendingMigrations(
      migrations,
      appliedMigrations,
    );
    const appliedVersions = new Set(
      appliedMigrations.map((migration) => migration.version),
    );

    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) {
        logger.info(`Skipped ${migration.filename}`);
      }
    }

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    for (const migration of pendingMigrations) {
      logger.info(`Applying ${migration.filename}`);

      await transaction(pool, async (client) => {
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
      });

      logger.success(`Applied ${migration.filename}`);
    }

    logger.success('All migrations applied successfully');
  });
}
