import { afterEach, beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.OTP_SECRET ??= 'test-otp-secret';
  process.env.JWT_ISSUER ??= 'koume-auths';
  process.env.JWT_PRIVATE_KEY_PATH ??= './keys/private.key';
  process.env.JWT_PUBLIC_KEY_PATH ??= './keys/public.key';
  process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/koume';
  process.env.REDIS_URL ??= 'redis://localhost:6379';
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
