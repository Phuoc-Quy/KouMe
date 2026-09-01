import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  createUser: vi.fn(),
  createOtp: vi.fn(),
  deleteOtp: vi.fn(),
  getOtp: vi.fn(),
  incrementAttempts: vi.fn(),
  consumeOtp: vi.fn(),
  createToken: vi.fn(),
  getToken: vi.fn(),
  deleteToken: vi.fn(),
  sendOtpMail: vi.fn(),
}));

vi.mock('../../src/auth/sign-up/sign-up.repository.js', () => ({
  signUpRepository: {
    findByEmail: mocks.findByEmail,
    findByUsername: mocks.findByUsername,
    createUser: mocks.createUser,
  },
  SignUpRepositoryConflictError: class extends Error {
    constructor(public field: 'email' | 'username') {
      super(`${field} already exists`);
      this.name = 'SignUpRepositoryConflictError';
    }
  },
}));

vi.mock('../../src/auth/sign-up/store/sign-up-otp.store.js', () => ({
  signUpOtpStore: {
    create: mocks.createOtp,
    delete: mocks.deleteOtp,
    get: mocks.getOtp,
    incrementAttempts: mocks.incrementAttempts,
    consume: mocks.consumeOtp,
  },
}));

vi.mock('../../src/auth/sign-up/store/sign-up-token.store.js', () => ({
  signUpTokenStore: {
    create: mocks.createToken,
    get: mocks.getToken,
    delete: mocks.deleteToken,
  },
}));

vi.mock('@server/shared/utils/mail.js', () => ({
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
  sendOtpMail: mocks.sendOtpMail,
}));

import { signUpService } from '../../src/auth/sign-up/sign-up.service.js';

describe('sign up service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests an otp for a new email', async () => {
    mocks.findByEmail.mockResolvedValue(false);
    mocks.sendOtpMail.mockResolvedValue(undefined);

    await expect(
      signUpService.request(' USER@EXAMPLE.COM '),
    ).resolves.toBeUndefined();

    expect(mocks.createOtp).toHaveBeenCalledTimes(1);
    expect(mocks.sendOtpMail).toHaveBeenCalledTimes(1);
  });

  it('rejects a registered email during request', async () => {
    mocks.findByEmail.mockResolvedValue(true);

    await expect(
      signUpService.request('user@example.com'),
    ).rejects.toMatchObject({
      code: 'EMAIL_REGISTERED',
    });
  });

  it('creates a signup token after valid otp verification', async () => {
    mocks.getOtp.mockResolvedValue({ otpHash: 'valid-hash', attempts: 0 });
    mocks.consumeOtp.mockResolvedValue(true);
    mocks.createToken.mockResolvedValue(undefined);

    const otpModule = await import('@server/shared/utils/otp.js');
    vi.spyOn(otpModule, 'verifyOtp').mockReturnValue(true);

    const token = await signUpService.verify('user@example.com', '123456');

    expect(token).toBeTypeOf('string');
    expect(mocks.createToken).toHaveBeenCalledTimes(1);
  });

  it('creates a user from a valid signup token', async () => {
    mocks.getToken.mockResolvedValue({ email: 'user@example.com' });
    mocks.findByEmail.mockResolvedValue(false);
    mocks.findByUsername.mockResolvedValue(false);
    mocks.createUser.mockResolvedValue({
      id: 'u-1',
      email: 'user@example.com',
      username: 'newuser',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await signUpService.create({
      signupToken: 'signup-token',
      username: 'NewUser',
      password: 'secret123',
    });

    expect(user.email).toBe('user@example.com');
    expect(user.username).toBe('newuser');
  });
});
