import { getRedisClient } from '@server/shared/infrastructure/redis/redis.js';

const RESET_TOKEN_TTL_SECONDS = 30 * 60;

const getResetTokenKey = (tokenHash: string) =>
  `forgot-password:token:${tokenHash}`;

export const forgotPasswordTokenStore = {
  async create(tokenHash: string, userId: string): Promise<void> {
    const redisClient = await getRedisClient();

    await redisClient.set(getResetTokenKey(tokenHash), userId, {
      EX: RESET_TOKEN_TTL_SECONDS,
    });
  },

  async consume(tokenHash: string): Promise<string | null> {
    const redisClient = await getRedisClient();

    return redisClient.getDel(getResetTokenKey(tokenHash));
  },
};
