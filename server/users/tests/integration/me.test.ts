import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyAccessToken: vi.fn(),
  findById: vi.fn(),
}));

vi.mock('@server/shared/utils/jwt.js', () => ({
  verifyAccessToken: mocks.verifyAccessToken,
}));

vi.mock('../../src/user/me/me.repository.js', () => ({
  meRepository: {
    findById: mocks.findById,
  },
}));

import { meService } from '../../src/user/me/me.service.js';

describe('me service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current user when token is valid', async () => {
    mocks.verifyAccessToken.mockReturnValue({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
      type: 'access',
    });

    mocks.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      role: 'user',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    const result = await meService.getMe('valid-access-token');

    expect(result).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
      username: 'user',
      role: 'user',
    });
    expect(mocks.findById).toHaveBeenCalledWith('user-1');
  });

  it('throws unauthorized when token is invalid', async () => {
    mocks.verifyAccessToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(meService.getMe('bad-token')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('throws user not found when user does not exist', async () => {
    mocks.verifyAccessToken.mockReturnValue({
      sub: 'missing-user',
      role: 'user',
      sid: 'session-1',
      type: 'access',
    });
    mocks.findById.mockResolvedValue(null);

    await expect(meService.getMe('valid-access-token')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });
});
