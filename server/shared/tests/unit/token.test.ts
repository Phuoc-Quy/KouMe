import { describe, expect, it } from 'vitest';

import { generateToken, hashToken } from '@server/shared/utils/token.js';

describe('token utils', () => {
  it('generates a non-empty token', () => {
    const token = generateToken();

    expect(token).toBeTypeOf('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('hashes deterministically for the same payload', () => {
    const token = 'abc123';

    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('hashes different inputs differently', () => {
    expect(hashToken('one')).not.toBe(hashToken('two'));
  });
});
