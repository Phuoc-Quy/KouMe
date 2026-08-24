import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { PoolClient } from 'pg';

export type MigrationFile = {
  version: number;
  name: string;
  filename: string;
  path: string;
  sql: string;
  checksum: string;
};

export type AppliedMigration = {
  version: number;
  name: string;
  checksum: string;
};

const MIGRATION_FILENAME = /^(\d{3})_([a-z0-9_]+)\.sql$/;
const IGNORED_MIGRATION_FILENAMES = new Set(['xxx_example.sql']);

function checksum(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function ensureMigrationTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      checksum TEXT NOT NULL
    );
  `);
}

export async function getMigrationFiles(
  migrationsDirectory: string,
): Promise<MigrationFile[]> {
  const filenames = await readdir(migrationsDirectory);

  const migrations: MigrationFile[] = [];

  for (const filename of filenames) {
    if (IGNORED_MIGRATION_FILENAMES.has(filename)) {
      continue;
    }

    const match = MIGRATION_FILENAME.exec(filename);

    if (!match) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    const version = match[1];
    const name = match[2];

    if (!version || !name) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    const migrationPath = path.join(migrationsDirectory, filename);

    const sql = await readFile(migrationPath, 'utf8');

    migrations.push({
      version: Number(version),
      name,
      filename,
      path: migrationPath,
      sql,
      checksum: checksum(sql),
    });
  }

  return migrations.sort((a, b) => a.version - b.version);
}

export async function getAppliedMigrations(
  client: PoolClient,
): Promise<AppliedMigration[]> {
  const result = await client.query<AppliedMigration>(`
    SELECT
      version,
      name,
      checksum
    FROM schema_migrations
    ORDER BY version ASC;
  `);

  return result.rows;
}

export function validateMigrationFiles(
  migrations: MigrationFile[],
  appliedMigrations: AppliedMigration[],
): void {
  const versions = new Set<number>();

  for (const migration of migrations) {
    if (versions.has(migration.version)) {
      throw new Error(
        `Duplicate migration version: ${migration.version
          .toString()
          .padStart(3, '0')}`,
      );
    }

    versions.add(migration.version);
  }

  for (const [index, migration] of migrations.entries()) {
    const expectedVersion = index;

    if (migration.version !== expectedVersion) {
      throw new Error(
        `Migration sequence is invalid. Expected ${expectedVersion
          .toString()
          .padStart(3, '0')}, found ${migration.version
          .toString()
          .padStart(3, '0')}`,
      );
    }
  }

  const migrationsByVersion = new Map(
    migrations.map((migration) => [migration.version, migration]),
  );

  for (const applied of appliedMigrations) {
    const migration = migrationsByVersion.get(applied.version);

    if (!migration) {
      throw new Error(
        `Applied migration ${applied.version
          .toString()
          .padStart(3, '0')} is missing from migrations directory`,
      );
    }

    if (migration.name !== applied.name) {
      throw new Error(
        `Migration ${migration.filename} has been renamed or replaced`,
      );
    }

    if (migration.checksum !== applied.checksum) {
      throw new Error(
        `Migration ${migration.filename} has been modified after being applied`,
      );
    }
  }
}

export function getPendingMigrations(
  migrations: MigrationFile[],
  appliedMigrations: AppliedMigration[],
): MigrationFile[] {
  const appliedVersions = new Set(
    appliedMigrations.map((migration) => migration.version),
  );

  return migrations.filter(
    (migration) => !appliedVersions.has(migration.version),
  );
}

export function ensureMigrationsUpToDate(
  migrations: MigrationFile[],
  appliedMigrations: AppliedMigration[],
): void {
  validateMigrationFiles(migrations, appliedMigrations);

  const pending = getPendingMigrations(migrations, appliedMigrations);

  if (pending.length > 0) {
    throw new Error('Database migrations are not up to date');
  }
}
