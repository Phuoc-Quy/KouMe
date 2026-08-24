import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from 'dotenv';

import type { Environment } from '../types/environment.js';

export interface LoadedEnv {
  NODE_ENV: Environment;
  DATABASE_URL: string;
}

type FileEnvironment = Exclude<Environment, 'custom'>;

interface EnvironmentFile {
  name: string;
  variables: Record<string, string>;
}

interface RequiredEnvVariables {
  nodeEnv: string;
  databaseUrl: string;
}

export function validateDatabaseUrl(databaseUrl: string): string {
  const value = databaseUrl.trim();

  if (!value) {
    throw new Error('DATABASE_URL cannot be empty');
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error(
      'DATABASE_URL must use the postgres or postgresql protocol',
    );
  }

  if (!url.hostname) {
    throw new Error('DATABASE_URL must include a hostname');
  }

  if (!url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_URL must include a database name');
  }

  return value;
}

function readEnvironmentFile(environment: FileEnvironment): EnvironmentFile {
  const name = `./workingDir/env/.env.${environment}`;
  const path = resolve(process.cwd(), name);

  if (!existsSync(path)) {
    throw new Error(`Environment file "${name}" was not found`);
  }

  try {
    return {
      name,
      variables: parse(readFileSync(path)),
    };
  } catch {
    throw new Error(`Unable to read environment file "${name}"`);
  }
}

function validateRequiredEnvVariables(
  variables: Record<string, string>,
  fileName: string,
): RequiredEnvVariables {
  const nodeEnv = variables.NODE_ENV?.trim();
  const databaseUrl = variables.DATABASE_URL?.trim();

  if (!nodeEnv) {
    throw new Error(`NODE_ENV is missing from "${fileName}"`);
  }

  if (!databaseUrl) {
    throw new Error(`DATABASE_URL is missing from "${fileName}"`);
  }

  return { nodeEnv, databaseUrl };
}

function loadFileEnvironment(environment: FileEnvironment): LoadedEnv {
  const file = readEnvironmentFile(environment);
  const variables = validateRequiredEnvVariables(file.variables, file.name);

  if (variables.nodeEnv !== environment) {
    throw new Error(
      `NODE_ENV in "${file.name}" must be "${environment}", received "${variables.nodeEnv}"`,
    );
  }

  try {
    return {
      NODE_ENV: environment,
      DATABASE_URL: validateDatabaseUrl(variables.databaseUrl),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid DATABASE_URL in "${file.name}": ${message}`);
  }
}

function loadCustomEnvironment(customDatabaseUrl?: string): LoadedEnv {
  if (customDatabaseUrl === undefined) {
    throw new Error('DATABASE_URL is required for the custom environment');
  }

  return {
    NODE_ENV: 'custom',
    DATABASE_URL: validateDatabaseUrl(customDatabaseUrl),
  };
}

function applyEnvironment(loadedEnv: LoadedEnv): void {
  process.env.NODE_ENV = loadedEnv.NODE_ENV;
  process.env.DATABASE_URL = loadedEnv.DATABASE_URL;
}

export function loadEnv(
  environment: Environment,
  customDatabaseUrl?: string,
): LoadedEnv {
  const loadedEnv =
    environment === 'custom'
      ? loadCustomEnvironment(customDatabaseUrl)
      : loadFileEnvironment(environment);

  applyEnvironment(loadedEnv);
  return loadedEnv;
}
