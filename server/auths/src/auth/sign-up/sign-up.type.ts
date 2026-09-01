export interface SignUpRequestInput {
  email: string;
}

export interface SignUpVerifyInput {
  email: string;
  otp: string;
}

export interface SignUpCreateInput {
  signupToken: string;
  username: string;
  password: string;
}

export interface SignUpUser {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SignUpErrorCode =
  | 'EMAIL_REGISTERED'
  | 'USERNAME_TAKEN'
  | 'INVALID_USERNAME'
  | 'INVALID_PASSWORD'
  | 'INVALID_OTP'
  | 'OTP_NOT_FOUND'
  | 'TOO_MANY_OTP_ATTEMPTS'
  | 'INVALID_SIGNUP_TOKEN';
