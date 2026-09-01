import { randomUUID } from 'node:crypto';

import { logInRepository } from './log-in.repository.js';

import type { LogInErrorCode, LogInInput, LogInResult } from './log-in.type.js';

import { verifyPassword } from '@server/shared/utils/password.js';

import { signAccessToken, signRefreshToken } from '@server/shared/utils/jwt.js';

import { hashToken } from '@server/shared/utils/token.js';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class LogInServiceError extends Error {
  constructor(
    public readonly code: LogInErrorCode,
    message: string,
  ) {
    super(message);

    this.name = 'LogInServiceError';
  }
}

export const logInService = {
  async logIn(input: LogInInput): Promise<LogInResult> {
    const identifier = input.identifier.trim().toLowerCase();

    const user = await logInRepository.findByIdentifier(identifier);

    if (!user) {
      throw new LogInServiceError(
        'INVALID_CREDENTIALS',
        'Invalid username/email or password',
      );
    }

    const passwordValid = await verifyPassword(
      input.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new LogInServiceError(
        'INVALID_CREDENTIALS',
        'Invalid username/email or password',
      );
    }

    const activeSession = await logInRepository.findActiveSessionByUser(
      user.id,
    );

    let sessionId: string;
    let accessToken: string;
    let refreshToken: string;
    let refreshTokenHash: string;
    let expiresAt: Date;

    if (activeSession) {
      sessionId = activeSession.id;

      const tokenPayload = {
        sub: user.id,
        role: user.role,
        sid: sessionId,
      };

      accessToken = signAccessToken(tokenPayload);
      refreshToken = signRefreshToken(tokenPayload);
      refreshTokenHash = hashToken(refreshToken);
      expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

      await logInRepository.rotateSession(
        sessionId,
        refreshTokenHash,
        expiresAt,
      );
    } else {
      sessionId = randomUUID();

      const tokenPayload = {
        sub: user.id,
        role: user.role,
        sid: sessionId,
      };

      accessToken = signAccessToken(tokenPayload);
      refreshToken = signRefreshToken(tokenPayload);
      refreshTokenHash = hashToken(refreshToken);
      expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

      await logInRepository.createSession({
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },
};
