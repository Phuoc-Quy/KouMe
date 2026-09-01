import 'dotenv/config';

export const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

export const getOptionalEnv = (name: string, fallback: string): string => {
  return process.env[name]?.trim() || fallback;
};
