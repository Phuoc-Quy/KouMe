import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revokeSession: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock('../../src/auth/log-out/log-out.repository.js', () => ({
  logOutRepository: {
    revokeSession: mocks.revokeSession,
  },
}));

vi.mock('@server/shared/utils/jwt.js', () => ({
  verifyRefreshToken: mocks.verifyRefreshToken,
}));

import { logOutService } from '../../src/auth/log-out/log-out.service.js';

describe('log out service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revokes the session for a valid refresh token', async () => {
    mocks.verifyRefreshToken.mockReturnValue({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
      type: 'refresh',
    });
    mocks.revokeSession.mockResolvedValue(true);

    await expect(
      logOutService.logOut('valid-refresh-token'),
    ).resolves.toBeUndefined();

    expect(mocks.revokeSession).toHaveBeenCalledWith({
      sessionId: 'session-1',
      userId: 'user-1',
      refreshTokenHash: expect.any(String),
    });
  });

  it('throws when the refresh token is invalid', async () => {
    mocks.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(logOutService.logOut('bad-token')).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
    });
  });
});
