import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findByIdentifier: vi.fn(),
  findActiveSessionByUser: vi.fn(),
  rotateSession: vi.fn(),
  createSession: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('../../src/auth/log-in/log-in.repository.js', () => ({
  logInRepository: {
    findByIdentifier: mocks.findByIdentifier,
    findActiveSessionByUser: mocks.findActiveSessionByUser,
    rotateSession: mocks.rotateSession,
    createSession: mocks.createSession,
  },
}));

vi.mock('@server/shared/utils/password.js', () => ({
  verifyPassword: mocks.verifyPassword,
}));

import { logInService } from '../../src/auth/log-in/log-in.service.js';

describe('log in service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns tokens and user when credentials are valid', async () => {
    mocks.findByIdentifier.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      passwordHash: 'hash',
      role: 'user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    });

    mocks.verifyPassword.mockResolvedValue(true);
    mocks.findActiveSessionByUser.mockResolvedValue(null);

    const result = await logInService.logIn({
      identifier: 'USER@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
    expect(result.user.email).toBe('user@example.com');
    expect(mocks.createSession).toHaveBeenCalledTimes(1);
  });

  it('rotates the existing active session instead of creating a new one', async () => {
    mocks.findByIdentifier.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      passwordHash: 'hash',
      role: 'user',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    });

    mocks.verifyPassword.mockResolvedValue(true);
    mocks.findActiveSessionByUser.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'old-hash',
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await logInService.logIn({
      identifier: 'user@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toBeTypeOf('string');
    expect(result.refreshToken).toBeTypeOf('string');
    expect(mocks.rotateSession).toHaveBeenCalledWith(
      'session-1',
      expect.any(String),
      expect.any(Date),
    );
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it('throws when credentials are invalid', async () => {
    mocks.findByIdentifier.mockResolvedValue(null);

    await expect(
      logInService.logIn({
        identifier: 'missing@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });
});
