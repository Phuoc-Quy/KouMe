import { router } from 'expo-router';
import { useState } from 'react';

type SignUpStage = 'email' | 'otp' | 'account';

type ApiError = {
  error?: string;
  message?: string;
};

const authsApiUrl = process.env.EXPO_PUBLIC_AUTHS_API_URL;
const USERNAME_PATTERN = /^[a-z0-9._-]{3,}$/;

const isValidPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const getAccountValidationError = (
  username: string,
  password: string,
  confirmPassword: string,
): string | null => {
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be at least 3 characters and use only a-z, 0-9, -, . or _';
  }

  if (!isValidPassword(password)) {
    return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

async function postSignUp(path: string, body: Record<string, string>) {
  if (!authsApiUrl) {
    throw new Error('Authentication service is not configured');
  }

  const response = await fetch(`${authsApiUrl}/auth/sign-up/${path}`, {
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

export function useSignUpScreen() {
  const [stage, setStage] = useState<SignUpStage>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearError();
  };

  const handleOtpChange = (value: string) => {
    setOtp(value.toUpperCase());
    clearError();
  };

  const handleRequestOtp = async () => {
    setIsSubmitting(true);
    clearError();

    try {
      await postSignUp('request', { email: email.trim() });
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
      setErrorMessage('Please enter the 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      const data = await postSignUp('verify-otp', {
        email: email.trim(),
        otp: normalizedOtp,
      });

      if (
        !data ||
        typeof (data as { signupToken?: unknown }).signupToken !== 'string'
      ) {
        throw new Error('Invalid signup verification response');
      }

      setSignupToken((data as { signupToken: string }).signupToken);
      setStage('account');
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

  const [signupToken, setSignupToken] = useState('');

  const handleCreateAccount = async () => {
    const validationError = getAccountValidationError(
      username,
      password,
      confirmPassword,
    );

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await postSignUp('create', {
        signupToken,
        username,
        password,
      });
      router.replace('/landing');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create account',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (stage === 'account') {
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

  const accountValidationError =
    stage === 'account' &&
    (username.length > 0 || password.length > 0 || confirmPassword.length > 0)
      ? getAccountValidationError(username, password, confirmPassword)
      : null;

  return {
    stage,
    email,
    otp,
    username,
    password,
    confirmPassword,
    errorMessage,
    accountValidationError,
    handleEmailChange,
    handleOtpChange,
    handleUsernameChange: (value: string) => {
      setUsername(value.toLowerCase());
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
    handleCreateAccount,
    handleBackPress,
    isSubmitting,
    isSubmitDisabled:
      (stage === 'email' && email.trim().length === 0) ||
      (stage === 'otp' && otp.length !== 6) ||
      (stage === 'account' &&
        getAccountValidationError(username, password, confirmPassword) !==
          null) ||
      isSubmitting,
  };
}
