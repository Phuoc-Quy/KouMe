import { describe, expect, it } from 'vitest';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@server/shared/utils/jwt.js';

describe('jwt utils', () => {
  it('signs and verifies an access token', () => {
    const token = signAccessToken({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
    });

    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('user');
    expect(payload.sid).toBe('session-1');
    expect(payload.type).toBe('access');
  });

  it('signs and verifies a refresh token', () => {
    const token = signRefreshToken({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
    });

    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('user');
    expect(payload.sid).toBe('session-1');
    expect(payload.type).toBe('refresh');
  });

  it('rejects mismatched token type', () => {
    const accessToken = signAccessToken({
      sub: 'user-1',
      role: 'user',
      sid: 'session-1',
    });

    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});
