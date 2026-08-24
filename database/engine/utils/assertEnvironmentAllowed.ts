import type { Environment } from '../engine/types/environment.js';

export function assertEnvironmentAllowed(
  action: string,
  allowedEnvironments: readonly Environment[],
): Environment {
  const environment = process.env.NODE_ENV;

  if (!environment) {
    throw new Error('NODE_ENV has not been loaded');
  }

  if (!allowedEnvironments.includes(environment as Environment)) {
    throw new Error(
      `${action} is not allowed in the "${environment}" environment`,
    );
  }

  return environment as Environment;
}
