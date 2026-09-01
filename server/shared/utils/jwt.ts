import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
  sub: string;
  role: string;
  sid: string;
  type: TokenType;
}

const getPrivateKey = (): string => {
  const path = process.env.JWT_PRIVATE_KEY_PATH;

  if (!path) {
    throw new Error('JWT_PRIVATE_KEY_PATH is not configured');
  }

  return readFileSync(path, 'utf8');
};

const getPublicKey = (): string => {
  const path = process.env.JWT_PUBLIC_KEY_PATH;

  if (!path) {
    throw new Error('JWT_PUBLIC_KEY_PATH is not configured');
  }

  return readFileSync(path, 'utf8');
};

const getIssuer = (): string => {
  const issuer = process.env.JWT_ISSUER;

  if (!issuer) {
    throw new Error('JWT_ISSUER is not configured');
  }

  return issuer;
};

const verifyToken = (token: string, expectedType: TokenType): TokenPayload => {
  const payload = jwt.verify(token, getPublicKey(), {
    algorithms: ['RS256'],
    issuer: getIssuer(),
  });

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.role !== 'string' ||
    typeof payload.sid !== 'string' ||
    payload.type !== expectedType
  ) {
    throw new Error(`Invalid ${expectedType} token`);
  }

  return {
    sub: payload.sub,
    role: payload.role,
    sid: payload.sid,
    type: expectedType,
  };
};

export const signAccessToken = (
  payload: Omit<TokenPayload, 'type'>,
): string => {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    getPrivateKey(),
    {
      algorithm: 'RS256',
      issuer: getIssuer(),
      expiresIn: '30m',
    },
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return verifyToken(token, 'access');
};

export const signRefreshToken = (
  payload: Omit<TokenPayload, 'type'>,
): string => {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    getPrivateKey(),
    {
      algorithm: 'RS256',
      issuer: getIssuer(),
      expiresIn: '30d',
    },
  );
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return verifyToken(token, 'refresh');
};
