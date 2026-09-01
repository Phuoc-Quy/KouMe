import { getRedisClient } from '@server/shared/infrastructure/redis/redis.js';

const SIGNUP_TOKEN_TTL_SECONDS = 30 * 60;

export interface SignUpTokenState {
  email: string;
}

const getSignUpTokenKey = (tokenHash: string) => `signup:token:${tokenHash}`;

export const signUpTokenStore = {
  async create(tokenHash: string, email: string): Promise<void> {
    const redisClient = await getRedisClient();
    const key = getSignUpTokenKey(tokenHash);

    await redisClient
      .multi()
      .hSet(key, {
        email,
      })
      .expire(key, SIGNUP_TOKEN_TTL_SECONDS)
      .exec();
  },

  async get(tokenHash: string): Promise<SignUpTokenState | null> {
    const redisClient = await getRedisClient();
    const state = await redisClient.hGetAll(getSignUpTokenKey(tokenHash));

    if (!state.email) {
      return null;
    }

    return {
      email: state.email,
    };
  },

  async delete(tokenHash: string): Promise<void> {
    const redisClient = await getRedisClient();
    await redisClient.del(getSignUpTokenKey(tokenHash));
  },
};
