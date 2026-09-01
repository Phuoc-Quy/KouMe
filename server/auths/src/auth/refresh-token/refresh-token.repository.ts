import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

export interface FindValidSessionInput {
  sessionId: string;
  userId: string;
  refreshTokenHash: string;
}

export interface CreateSessionInput {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export const refreshTokenRepository = {
  async findValidSession(input: FindValidSessionInput): Promise<{
    id: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  } | null> {
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
        WHERE id = $1
          AND user_id = $2
          AND refresh_token_hash = $3
          AND revoked_at IS NULL
          AND expires_at > NOW()
        LIMIT 1
      `,
      [input.sessionId, input.userId, input.refreshTokenHash],
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

  async revokeSession(sessionId: string): Promise<boolean> {
    const result = await getDatabasePool().query(
      `
        UPDATE sessions
        SET revoked_at = NOW()
        WHERE id = $1
          AND revoked_at IS NULL
      `,
      [sessionId],
    );

    return result.rowCount !== 0;
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
