import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ensureMigrationTable,
  ensureMigrationsUpToDate,
  getAppliedMigrations,
  getMigrationFiles,
} from '../lib/migration.js';
import { transaction } from '../lib/transaction.js';
import { logger } from '../templates/logger.js';
import type { Environment } from '../types/environment.js';
import { assertEnvironmentAllowed } from '../utils/assertEnvironmentAllowed.js';
import { connectDb } from '../utils/connectDb.js';

const SEED_ENVIRONMENTS: readonly Environment[] = [
  'development',
  'test',
  'custom',
];

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, '../../workingDir/migrations');

export async function seed(seedFile: string): Promise<void> {
  assertEnvironmentAllowed('Seed', SEED_ENVIRONMENTS);

  if (path.extname(seedFile).toLowerCase() !== '.sql') {
    throw new Error('Seed file must use the .sql extension');
  }

  const sql = await readFile(seedFile, 'utf8');

  if (!sql.trim()) {
    throw new Error(`Seed file "${seedFile}" cannot be empty`);
  }

  const filename = path.basename(seedFile);

  await connectDb(async (pool) => {
    logger.info('Connected to database');

    const migrations = await getMigrationFiles(migrationsDirectory);
    const appliedMigrations = await transaction(pool, async (client) => {
      await ensureMigrationTable(client);
      return getAppliedMigrations(client);
    });

    ensureMigrationsUpToDate(migrations, appliedMigrations);
    logger.info('Migrations are up to date');

    logger.info(`Seeding ${filename}`);

    await transaction(pool, async (client) => {
      await client.query(sql);
    });

    logger.success(`Seeded ${filename} successfully`);
  });
}
