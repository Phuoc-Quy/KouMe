import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

import type { ForgotPasswordUser } from './forgot-password.type.js';

export const forgotPasswordRepository = {
  async findByEmail(email: string): Promise<ForgotPasswordUser | null> {
    const result = await getDatabasePool().query<{
      id: string;
      email: string;
    }>(
      `
        SELECT
          id,
          email
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  },

  async resetPassword(userId: string, passwordHash: string): Promise<boolean> {
    const client = await getDatabasePool().connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `
          UPDATE users
          SET
            password_hash = $2,
            updated_at = NOW()
          WHERE id = $1
          RETURNING id
        `,
        [userId, passwordHash],
      );

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      await client.query(
        `
          UPDATE sessions
          SET revoked_at = NOW()
          WHERE user_id = $1
            AND revoked_at IS NULL
        `,
        [userId],
      );

      await client.query('COMMIT');

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
