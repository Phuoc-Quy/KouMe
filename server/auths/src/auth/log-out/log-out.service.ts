import { logOutRepository } from './log-out.repository.js';

import { verifyRefreshToken } from '@server/shared/utils/jwt.js';
import { hashToken } from '@server/shared/utils/token.js';

import type { LogOutErrorCode } from './log-out.type.js';

export class LogOutServiceError extends Error {
  constructor(
    public readonly code: LogOutErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'LogOutServiceError';
  }
}

export const logOutService = {
  async logOut(refreshToken: string): Promise<void> {
    let payload: ReturnType<typeof verifyRefreshToken>;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new LogOutServiceError(
        'INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }

    const refreshTokenHash = hashToken(refreshToken);
    const revoked = await logOutRepository.revokeSession({
      sessionId: payload.sid,
      userId: payload.sub,
      refreshTokenHash,
    });

    if (!revoked) {
      throw new LogOutServiceError(
        'INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }
  },
};
