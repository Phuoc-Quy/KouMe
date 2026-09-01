import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findValidSession: vi.fn(),
  revokeSession: vi.fn(),
  createSession: vi.fn(),
  verifyRefreshToken: vi.fn(),
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
}));

vi.mock('../../src/auth/refresh-token/refresh-token.repository.js', () => ({
  refreshTokenRepository: {
    findValidSession: mocks.findValidSession,
    revokeSession: mocks.revokeSession,
    createSession: mocks.createSession,
  },
}));

vi.mock('@server/shared/utils/jwt.js', () => ({
  signAccessToken: mocks.signAccessToken,
  signRefreshToken: mocks.signRefreshToken,
  verifyRefreshToken: mocks.verifyRefreshToken,
}));

import { refreshTokenService } from '../../src/auth/refresh-token/refresh-token.service.js';

describe('refresh token service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns new access and refresh tokens when the current session is valid', async () => {
    const validRefreshToken = 'valid-refresh-token';

    mocks.verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
      type: 'refresh',
    });
    mocks.findValidSession.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.revokeSession.mockResolvedValue(true);
    mocks.signAccessToken.mockReturnValue('new-access-token');
    mocks.signRefreshToken.mockReturnValue('new-refresh-token');

    const result = await refreshTokenService.refresh(validRefreshToken);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(mocks.revokeSession).toHaveBeenCalledWith('session-1');
    expect(mocks.createSession).toHaveBeenCalledTimes(1);
  });

  it('throws when the refresh token is invalid', async () => {
    mocks.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(
      refreshTokenService.refresh('bad-token'),
    ).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    });
  });
});
