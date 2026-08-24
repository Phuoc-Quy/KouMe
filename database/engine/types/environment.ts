export const ENVIRONMENTS = [
  'development',
  'test',
  'production',
  'custom',
] as const;

export type Environment = (typeof ENVIRONMENTS)[number];
