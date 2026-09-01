import { createClient } from 'redis';

const connectRedisClient = async () => {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured');
  }

  const client = createClient({
    url: redisUrl,
  });

  client.on('error', (error: Error) => {
    console.error('Redis client error:', error);
  });

  await client.connect();

  return client;
};

let redisClientPromise: ReturnType<typeof connectRedisClient> | null = null;

export const getRedisClient = (): ReturnType<typeof connectRedisClient> => {
  if (!redisClientPromise) {
    redisClientPromise = connectRedisClient().catch((error: unknown) => {
      redisClientPromise = null;
      throw error;
    });
  }

  return redisClientPromise;
};

export const closeRedisClient = async (): Promise<void> => {
  if (!redisClientPromise) {
    return;
  }

  const client = await redisClientPromise;

  if (client.isOpen) {
    await client.quit();
  }

  redisClientPromise = null;
};
