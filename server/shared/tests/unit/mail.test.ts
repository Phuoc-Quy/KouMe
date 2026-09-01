import { describe, expect, it } from 'vitest';

import { normalizeEmail } from '@server/shared/utils/mail.js';

describe('mail utils', () => {
  it('normalizes email by trimming and lowercasing', () => {
    expect(normalizeEmail('  USER@Example.com  ')).toBe('user@example.com');
  });

  it('keeps valid lowercase email after normalization', () => {
    expect(normalizeEmail('hello@koume.app')).toBe('hello@koume.app');
  });
});
