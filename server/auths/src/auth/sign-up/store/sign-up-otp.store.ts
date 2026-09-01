import { getRedisClient } from '@server/shared/infrastructure/redis/redis.js';

const SIGNUP_OTP_TTL_SECONDS = 15 * 60;

export interface SignUpOtpState {
  otpHash: string;
  attempts: number;
}

const getSignUpOtpKey = (email: string) => `signup:otp:${email}`;

export const signUpOtpStore = {
  async create(email: string, otpHash: string): Promise<void> {
    const redisClient = await getRedisClient();
    const key = getSignUpOtpKey(email);

    await redisClient
      .multi()
      .hSet(key, {
        otpHash,
        attempts: '0',
      })
      .expire(key, SIGNUP_OTP_TTL_SECONDS)
      .exec();
  },

  async get(email: string): Promise<SignUpOtpState | null> {
    const redisClient = await getRedisClient();
    const state = await redisClient.hGetAll(getSignUpOtpKey(email));

    if (!state.otpHash || state.attempts === undefined) {
      return null;
    }

    const attempts = Number(state.attempts);

    if (!Number.isInteger(attempts) || attempts < 0) {
      return null;
    }

    return {
      otpHash: state.otpHash,
      attempts,
    };
  },

  async incrementAttempts(email: string): Promise<number | null> {
    const redisClient = await getRedisClient();
    const key = getSignUpOtpKey(email);

    const exists = await redisClient.exists(key);

    if (!exists) {
      return null;
    }

    return redisClient.hIncrBy(key, 'attempts', 1);
  },

  async delete(email: string): Promise<void> {
    const redisClient = await getRedisClient();
    await redisClient.del(getSignUpOtpKey(email));
  },

  async consume(email: string): Promise<boolean> {
    const redisClient = await getRedisClient();
    const deleted = await redisClient.del(getSignUpOtpKey(email));

    return deleted === 1;
  },
};
