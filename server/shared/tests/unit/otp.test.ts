import { describe, expect, it } from 'vitest';

import {
  generateOtp,
  hashOtp,
  isValidOtp,
  verifyOtp,
} from '@server/shared/utils/otp.js';

describe('otp utils', () => {
  it('generates a 6-character alphanumeric code', () => {
    const otp = generateOtp();

    expect(otp).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('validates the otp format', () => {
    expect(isValidOtp('A1B2C3')).toBe(true);
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('a1B2C3')).toBe(false);
    expect(isValidOtp('A1B2C')).toBe(false);
  });

  it('verifies a valid otp hash', () => {
    const otp = 'A1B2C3';
    const hash = hashOtp(otp);

    expect(verifyOtp(otp, hash)).toBe(true);
  });

  it('rejects an invalid otp', () => {
    const otp = 'A1B2C3';

    expect(verifyOtp('D4E5F6', hashOtp(otp))).toBe(false);
  });
});
