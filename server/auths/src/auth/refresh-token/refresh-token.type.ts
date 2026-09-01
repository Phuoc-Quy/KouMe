export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenErrorCode = 'INVALID_REFRESH_TOKEN';
