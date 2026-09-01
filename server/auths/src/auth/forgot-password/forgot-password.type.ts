export interface ForgotPasswordRequestInput {
  email: string;
}

export interface ForgotPasswordVerifyInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordResetInput {
  resetToken: string;
  password: string;
}

export interface ForgotPasswordUser {
  id: string;
  email: string;
}

export type ForgotPasswordErrorCode =
  | 'INVALID_OTP'
  | 'OTP_NOT_FOUND'
  | 'TOO_MANY_OTP_ATTEMPTS'
  | 'INVALID_RESET_TOKEN'
  | 'INVALID_PASSWORD';
