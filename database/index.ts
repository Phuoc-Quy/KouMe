import { database } from './engine/scripts/database.js';
import { logger } from './engine/templates/logger.js';

async function main(): Promise<void> {
  try {
    await database();
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      logger.info('Operation interrupted by user');
      return;
    }

    logger.error(error instanceof Error ? error.message : 'Unknown error');

    process.exitCode = 1;
  }
}

await main();
