import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '@server/shared/utils/password.js';

describe('password utils', () => {
  it('hashes and verifies the same password', async () => {
    const password = 'P@ssw0rd123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct-password');

    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });
});
