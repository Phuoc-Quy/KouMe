export interface LogInInput {
  identifier: string;
  password: string;
}

export interface LogInUserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogInUser {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogInResult {
  accessToken: string;
  refreshToken: string;
  user: LogInUser;
}

export type LogInErrorCode = 'INVALID_CREDENTIALS';
