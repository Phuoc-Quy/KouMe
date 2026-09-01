import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

const OTP_LENGTH = 6;
const OTP_CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isValidOtp = (otp: string): boolean =>
  new RegExp(`^[${OTP_CHARACTERS}]{${OTP_LENGTH}}$`).test(otp);

const getOtpSecret = (): string => {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error('OTP_SECRET is not configured');
  }

  return secret;
};

export const generateOtp = (): string => {
  return Array.from({ length: OTP_LENGTH }, () => {
    return OTP_CHARACTERS[randomInt(0, OTP_CHARACTERS.length)];
  }).join('');
};

export const hashOtp = (otp: string): string => {
  return createHmac('sha256', getOtpSecret()).update(otp).digest('hex');
};

export const verifyOtp = (otp: string, expectedHash: string): boolean => {
  const actualHash = hashOtp(otp);

  const actualBuffer = Buffer.from(actualHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
};
