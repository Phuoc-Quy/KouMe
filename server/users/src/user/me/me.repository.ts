import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

import type { MeUserRecord } from './me.type.js';

export const meRepository = {
  async findById(id: string): Promise<MeUserRecord | null> {
    const result = await getDatabasePool().query<{
      id: string;
      email: string;
      username: string;
      role: string;
      created_at: Date;
      updated_at: Date;
    }>(
      `
        SELECT
          id,
          email,
          username,
          role,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
};
