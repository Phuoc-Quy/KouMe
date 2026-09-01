import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

import type { LogInUserRecord } from './log-in.type.js';

export interface CreateSessionInput {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface ActiveSessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export const logInRepository = {
  async findByIdentifier(identifier: string): Promise<LogInUserRecord | null> {
    const result = await getDatabasePool().query<{
      id: string;
      email: string;
      username: string;
      password_hash: string;
      role: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          id,
          email,
          username,
          password_hash,
          role,
          created_at,
          updated_at
        FROM users
        WHERE email = $1
           OR username = $1
        LIMIT 1
      `,
      [identifier],
    );

    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.password_hash,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },

  async findActiveSessionByUser(
    userId: string,
  ): Promise<ActiveSessionRecord | null> {
    const result = await getDatabasePool().query<{
      id: string;
      user_id: string;
      refresh_token_hash: string;
      expires_at: Date;
    }>(
      `
        SELECT
          id,
          user_id,
          refresh_token_hash,
          expires_at
        FROM sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [userId],
    );

    const session = result.rows[0];

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      userId: session.user_id,
      refreshTokenHash: session.refresh_token_hash,
      expiresAt: session.expires_at,
    };
  },

  async rotateSession(
    sessionId: string,
    nextRefreshTokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await getDatabasePool().query(
      `
        UPDATE sessions
        SET refresh_token_hash = $2,
            expires_at = $3,
            revoked_at = NULL,
            updated_at = NOW()
        WHERE id = $1
      `,
      [sessionId, nextRefreshTokenHash, expiresAt],
    );
  },

  async createSession(input: CreateSessionInput): Promise<void> {
    await getDatabasePool().query(
      `
        INSERT INTO sessions (
          id,
          user_id,
          refresh_token_hash,
          expires_at
        )
        VALUES ($1, $2, $3, $4)
      `,
      [input.id, input.userId, input.refreshTokenHash, input.expiresAt],
    );
  },
};
