export interface LogOutInput {
  refreshToken: string;
}

export interface LogOutSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
}

export type LogOutErrorCode = 'INVALID_REFRESH_TOKEN';
