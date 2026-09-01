import { randomUUID } from 'node:crypto';

import { refreshTokenRepository } from './refresh-token.repository.js';

import type {
  RefreshTokenErrorCode,
  RefreshTokenResult,
} from './refresh-token.type.js';

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@server/shared/utils/jwt.js';

import { hashToken } from '@server/shared/utils/token.js';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class RefreshTokenServiceError extends Error {
  constructor(
    public readonly code: RefreshTokenErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'RefreshTokenServiceError';
  }
}

export const refreshTokenService = {
  async refresh(refreshToken: string): Promise<RefreshTokenResult> {
    let payload: ReturnType<typeof verifyRefreshToken>;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new RefreshTokenServiceError(
        'INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session = await refreshTokenRepository.findValidSession({
      sessionId: payload.sid,
      userId: payload.sub,
      refreshTokenHash,
    });

    if (!session) {
      throw new RefreshTokenServiceError(
        'INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }

    const nextSessionId = randomUUID();
    const tokenPayload = {
      sub: payload.sub,
      role: payload.role,
      sid: nextSessionId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const nextRefreshToken = signRefreshToken(tokenPayload);
    const nextRefreshTokenHash = hashToken(nextRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const revoked = await refreshTokenRepository.revokeSession(session.id);

    if (!revoked) {
      throw new RefreshTokenServiceError(
        'INVALID_REFRESH_TOKEN',
        'Invalid or expired refresh token',
      );
    }

    await refreshTokenRepository.createSession({
      id: nextSessionId,
      userId: payload.sub,
      refreshTokenHash: nextRefreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  },
};
