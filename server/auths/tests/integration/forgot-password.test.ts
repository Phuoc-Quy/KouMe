import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  createOtp: vi.fn(),
  deleteOtp: vi.fn(),
  getOtp: vi.fn(),
  incrementAttempts: vi.fn(),
  consumeOtp: vi.fn(),
  createToken: vi.fn(),
  consumeToken: vi.fn(),
  resetPassword: vi.fn(),
  sendOtpMail: vi.fn(),
}));

vi.mock('../../src/auth/forgot-password/forgot-password.repository.js', () => ({
  forgotPasswordRepository: {
    findByEmail: mocks.findByEmail,
    resetPassword: mocks.resetPassword,
  },
}));

vi.mock(
  '../../src/auth/forgot-password/store/forgot-password-otp.store.js',
  () => ({
    forgotPasswordOtpStore: {
      create: mocks.createOtp,
      delete: mocks.deleteOtp,
      get: mocks.getOtp,
      incrementAttempts: mocks.incrementAttempts,
      consume: mocks.consumeOtp,
    },
  }),
);

vi.mock(
  '../../src/auth/forgot-password/store/forgot-password-token.store.js',
  () => ({
    forgotPasswordTokenStore: {
      create: mocks.createToken,
      consume: mocks.consumeToken,
    },
  }),
);

vi.mock('@server/shared/utils/mail.js', () => ({
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
  sendOtpMail: mocks.sendOtpMail,
}));

import { forgotPasswordService } from '../../src/auth/forgot-password/forgot-password.service.js';

describe('forgot password service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an otp and sends it for an existing user', async () => {
    mocks.findByEmail.mockResolvedValue({ id: 'user-1' });
    mocks.sendOtpMail.mockResolvedValue(undefined);

    await expect(
      forgotPasswordService.request('user@example.com'),
    ).resolves.toBeUndefined();

    expect(mocks.createOtp).toHaveBeenCalledTimes(1);
    expect(mocks.sendOtpMail).toHaveBeenCalledTimes(1);
  });

  it('returns a reset token after valid otp verification', async () => {
    mocks.getOtp.mockResolvedValue({ otpHash: 'valid-hash', attempts: 0 });
    mocks.findByEmail.mockResolvedValue({ id: 'user-1' });
    mocks.consumeOtp.mockResolvedValue(true);
    mocks.createToken.mockResolvedValue(undefined);

    const otpModule = await import('@server/shared/utils/otp.js');
    vi.spyOn(otpModule, 'verifyOtp').mockReturnValue(true);

    const token = await forgotPasswordService.verify(
      'user@example.com',
      '123456',
    );

    expect(token).toBeTypeOf('string');
    expect(mocks.createToken).toHaveBeenCalledTimes(1);
  });

  it('resets password when reset token is valid', async () => {
    mocks.consumeToken.mockResolvedValue('user-1');
    mocks.resetPassword.mockResolvedValue(true);

    await expect(
      forgotPasswordService.reset({
        resetToken: 'reset-token',
        password: 'NewPassword1!',
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects passwords that do not follow the 8-4 rule', async () => {
    await expect(
      forgotPasswordService.reset({
        resetToken: 'reset-token',
        password: 'new-password',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_PASSWORD' });

    expect(mocks.consumeToken).not.toHaveBeenCalled();
  });
});
