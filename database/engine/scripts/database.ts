import { input, password, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createSelectTheme } from '../templates/selectTheme.js';
import { logger } from '../templates/logger.js';
import type { Environment } from '../types/environment.js';
import { loadEnv } from '../utils/loadEnv.js';

type EnvironmentMenuChoice = Environment | 'exit';
type ActionMenuChoice =
  'migrate' | 'seed' | 'reset' | 'switch-environment' | 'exit';

type ActionMenuResult = 'switch-environment' | 'exit';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const seedsDirectory = path.resolve(currentDirectory, '../../workingDir/seeds');

const environmentSelectTheme = createSelectTheme({
  Development: chalk.greenBright,
  Test: chalk.blueBright,
  Production: chalk.yellowBright,
  Custom: chalk.magentaBright,
  Exit: chalk.gray,
});

const confirmSelectTheme = createSelectTheme({
  Yes: chalk.redBright,
  No: chalk.greenBright,
});

const actionSelectTheme = createSelectTheme({
  Migrate: chalk.cyanBright,
  Reset: chalk.cyanBright,
  Seed: chalk.cyanBright,
  'Switch Environment': chalk.cyanBright,
  Exit: chalk.cyanBright,
});

async function environmentMenu(): Promise<EnvironmentMenuChoice> {
  return select({
    message: 'Select Enviroment',
    choices: [
      { name: 'Development', value: 'development' },
      { name: 'Test', value: 'test' },
      { name: 'Production', value: 'production' },
      { name: 'Custom', value: 'custom' },
      { name: 'Exit', value: 'exit' },
    ],
    theme: environmentSelectTheme,
  });
}

async function actionMenu(): Promise<ActionMenuChoice> {
  return select({
    message: 'Select action',
    choices: [
      { name: 'Migrate', value: 'migrate' },
      { name: 'Seed', value: 'seed' },
      { name: 'Reset', value: 'reset' },
      { name: 'Switch Environment', value: 'switch-environment' },
      { name: 'Exit', value: 'exit' },
    ],
    theme: actionSelectTheme,
  });
}

async function confirmMenu(message: string): Promise<boolean> {
  return select({
    message,
    choices: [
      { name: 'No', value: false },
      { name: 'Yes', value: true },
    ],
    default: false,
    theme: confirmSelectTheme,
  });
}

async function customDatabaseUrlInput(): Promise<string> {
  return password({
    message: 'Enter DATABASE_URL:',
  });
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function seedFileInput(): Promise<string> {
  const providedPath = (
    await input({
      message: 'Enter seed file path',
    })
  ).trim();

  if (!providedPath) {
    throw new Error('Seed file path cannot be empty');
  }

  const seedFile = path.resolve(process.cwd(), providedPath);

  if (path.extname(seedFile).toLowerCase() !== '.sql') {
    throw new Error('Seed file must use the .sql extension');
  }

  if (!(await isFile(seedFile))) {
    throw new Error(`Seed file "${seedFile}" was not found`);
  }

  return seedFile;
}

async function getSeedFile(environment: Environment): Promise<string | null> {
  const environmentSeedFile = path.join(
    seedsDirectory,
    `${environment}_seed.sql`,
  );

  if (await isFile(environmentSeedFile)) {
    return environmentSeedFile;
  }

  logger.warning(`Seed file "${environmentSeedFile}" was not found`);

  const useAnotherFile = await confirmMenu(
    'Do you want to provide another seed file?',
  );

  return useAnotherFile ? seedFileInput() : null;
}

async function actionMenuLoop(
  environment: Environment,
): Promise<ActionMenuResult> {
  while (true) {
    const action = await actionMenu();

    if (action === 'migrate') {
      const { migrate } = await import('./migrate.js');
      await migrate();
      continue;
    }

    if (action === 'seed') {
      const seedFile = await getSeedFile(environment);

      if (!seedFile) {
        logger.info('Seeding cancelled');
        continue;
      }

      const { seed } = await import('./seed.js');
      await seed(seedFile);
      continue;
    }

    if (action === 'reset') {
      const { reset } = await import('./reset.js');
      await reset();
      continue;
    }

    return action;
  }
}

export async function database(): Promise<void> {
  while (true) {
    const environment = await environmentMenu();

    if (environment === 'exit') {
      logger.info('Goodbye.');
      return;
    }

    if (environment === 'production') {
      logger.warning('You are about to use the production environment.');

      const confirmed = await confirmMenu('Are you sure you want to continue?');

      if (!confirmed) {
        continue;
      }
    }

    if (environment === 'custom') {
      const databaseUrl = await customDatabaseUrlInput();
      loadEnv(environment, databaseUrl);
    } else {
      loadEnv(environment);
    }

    const result = await actionMenuLoop(environment);

    if (result === 'exit') {
      logger.info('Goodbye.');
      return;
    }
  }
}
