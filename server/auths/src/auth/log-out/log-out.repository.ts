import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

export interface RevokeSessionInput {
  sessionId: string;
  userId: string;
  refreshTokenHash: string;
}

export const logOutRepository = {
  async revokeSession(input: RevokeSessionInput): Promise<boolean> {
    const result = await getDatabasePool().query(
      `
        UPDATE sessions
        SET revoked_at = NOW()
        WHERE id = $1
          AND user_id = $2
          AND refresh_token_hash = $3
          AND revoked_at IS NULL
      `,
      [input.sessionId, input.userId, input.refreshTokenHash],
    );

    return result.rowCount !== 0;
  },
};
