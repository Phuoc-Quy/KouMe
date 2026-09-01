import { verifyAccessToken } from '@server/shared/utils/jwt.js';

import { meRepository } from './me.repository.js';

import type { MeResponse, MeUserRecord } from './me.type.js';

export class MeServiceError extends Error {
  constructor(
    public readonly code: 'UNAUTHORIZED' | 'USER_NOT_FOUND',
    message: string,
  ) {
    super(message);

    this.name = 'MeServiceError';
  }
}

export const meService = {
  async getMe(accessToken: string): Promise<MeResponse> {
    let payload: { sub: string; role: string; sid: string; type: string };

    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      throw new MeServiceError(
        'UNAUTHORIZED',
        'Invalid or expired access token',
      );
    }

    const user = await meRepository.findById(payload.sub);

    if (!user) {
      throw new MeServiceError('USER_NOT_FOUND', 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
