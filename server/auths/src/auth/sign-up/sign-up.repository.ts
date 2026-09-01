import { getDatabasePool } from '@server/shared/infrastructure/database/database.js';

import type { SignUpUser } from './sign-up.type.js';

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
}

export type SignUpConflictField = 'email' | 'username';

export class SignUpRepositoryConflictError extends Error {
  constructor(public readonly field: SignUpConflictField) {
    super(`${field} already exists`);

    this.name = 'SignUpRepositoryConflictError';
  }
}

export const signUpRepository = {
  async findByEmail(email: string): Promise<boolean> {
    const result = await getDatabasePool().query(
      `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    return result.rowCount !== 0;
  },

  async findByUsername(username: string): Promise<boolean> {
    const result = await getDatabasePool().query(
      `
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1
      `,
      [username],
    );

    return result.rowCount !== 0;
  },

  async createUser(input: CreateUserInput): Promise<SignUpUser> {
    try {
      const result = await getDatabasePool().query<{
        id: string;
        email: string;
        username: string;
        role: string;
        created_at: Date;
        updated_at: Date;
      }>(
        `
          INSERT INTO users (
            email,
            username,
            password_hash
          )
          VALUES ($1, $2, $3)
          RETURNING
            id,
            email,
            username,
            role,
            created_at,
            updated_at
        `,
        [input.email, input.username, input.passwordHash],
      );

      const user = result.rows[0];

      if (!user) {
        throw new Error('Failed to create user');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      const databaseError = error as {
        code?: string;
        constraint?: string;
      };

      if (databaseError.code === '23505') {
        if (databaseError.constraint === 'users_email_key') {
          throw new SignUpRepositoryConflictError('email');
        }

        if (databaseError.constraint === 'users_username_key') {
          throw new SignUpRepositoryConflictError('username');
        }
      }

      throw error;
    }
  },
};
