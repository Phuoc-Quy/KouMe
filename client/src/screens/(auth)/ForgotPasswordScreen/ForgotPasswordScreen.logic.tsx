import { router } from 'expo-router';
import { useState } from 'react';

type ForgotPasswordStage = 'email' | 'otp' | 'password';

type ApiError = {
  error?: string;
  message?: string;
};

const authsApiUrl = process.env.EXPO_PUBLIC_AUTHS_API_URL;

const isValidPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

async function postForgotPassword(
  path: string,
  body: Record<string, string>,
): Promise<ApiError | null> {
  if (!authsApiUrl) {
    throw new Error('Authentication service is not configured');
  }

  const response = await fetch(`${authsApiUrl}/auth/forgot-password/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as ApiError | null;

  if (!response.ok) {
    const error = new Error(data?.message ?? 'Something went wrong');
    Object.assign(error, { code: data?.error });
    throw error;
  }

  return data;
}

export function useForgotPasswordScreen() {
  const [stage, setStage] = useState<ForgotPasswordStage>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  const handleRequestOtp = async () => {
    setIsSubmitting(true);
    clearError();

    try {
      await postForgotPassword('request', { email: email.trim() });
      setOtp('');
      setStage('otp');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to send OTP',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (value = otp) => {
    const normalizedOtp = value.toUpperCase();

    if (normalizedOtp.length !== 6) {
      setErrorMessage('Please enter the 6-character OTP');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const data = await postForgotPassword('verify-otp', {
        email: email.trim(),
        otp: normalizedOtp,
      });

      if (
        !data ||
        typeof (data as { resetToken?: unknown }).resetToken !== 'string'
      ) {
        throw new Error('Invalid password reset response');
      }

      setResetToken((data as { resetToken: string }).resetToken);
      setStage('password');
    } catch (error) {
      const code = (error as Error & { code?: string }).code;

      if (code === 'TOO_MANY_OTP_ATTEMPTS' || code === 'OTP_NOT_FOUND') {
        setOtp('');
        setStage('email');
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to verify OTP',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(password)) {
      setErrorMessage(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await postForgotPassword('reset', { resetToken, password });
      router.replace('/(auth)/log-in');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to reset password',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (stage === 'password') {
      setStage('otp');
      setErrorMessage(null);
      return;
    }

    if (stage === 'otp') {
      setStage('email');
      setOtp('');
      setErrorMessage(null);
      return;
    }

    router.back();
  };

  const passwordError =
    stage === 'password' && password.length > 0 && !isValidPassword(password)
      ? 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
      : null;
  const confirmPasswordError =
    stage === 'password' &&
    confirmPassword.length > 0 &&
    password !== confirmPassword
      ? 'Passwords do not match'
      : null;

  return {
    stage,
    email,
    otp,
    password,
    confirmPassword,
    errorMessage,
    passwordError,
    confirmPasswordError,
    handleEmailChange: (value: string) => {
      setEmail(value);
      clearError();
    },
    handleOtpChange: (value: string) => {
      setOtp(value.toUpperCase());
      clearError();
    },
    handlePasswordChange: (value: string) => {
      setPassword(value);
      clearError();
    },
    handleConfirmPasswordChange: (value: string) => {
      setConfirmPassword(value);
      clearError();
    },
    handleRequestOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackPress,
    isSubmitting,
    isSubmitDisabled:
      (stage === 'email' && email.trim().length === 0) ||
      (stage === 'otp' && otp.length !== 6) ||
      (stage === 'password' &&
        (!isValidPassword(password) || password !== confirmPassword)) ||
      isSubmitting,
  };
}
