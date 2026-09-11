import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useState } from 'react';

const authsApiUrl = process.env.EXPO_PUBLIC_AUTHS_API_URL;
const usersApiUrl = process.env.EXPO_PUBLIC_USERS_API_URL;

const ACCESS_TOKEN_KEY = 'koume.access-token';
const REFRESH_TOKEN_KEY = 'koume.refresh-token';

type ApiError = {
  message?: string;
};

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
};

type LoginTokens = {
  accessToken: string;
  refreshToken: string;
};

async function requestLogin(
  identifier: string,
  password: string,
): Promise<LoginTokens> {
  if (!authsApiUrl) {
    throw new Error('Authentication service is not configured');
  }

  const response = await fetch(`${authsApiUrl}/auth/log-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: identifier.trim(), password }),
  });
  const data = (await response.json().catch(() => null)) as
    (ApiError & LoginResponse) | null;

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to log in');
  }

  if (!data?.accessToken || !data.refreshToken) {
    throw new Error('Invalid login response');
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

async function requestCurrentUser(accessToken: string) {
  if (!usersApiUrl) {
    throw new Error('Users service is not configured');
  }

  const response = await fetch(`${usersApiUrl}/user/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await response.json().catch(() => null)) as ApiError | null;

  if (!response.ok) {
    throw new Error(data?.message ?? 'Unable to load your account');
  }

  return data;
}

export function handleBackPress() {
  router.back();
}

export function useLogInScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    setErrorMessage(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage(null);
  };

  const handleLogIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { accessToken, refreshToken } = await requestLogin(
        identifier,
        password,
      );

      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await requestCurrentUser(accessToken);

      router.replace('/dashboard');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to log in',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    identifier,
    password,
    errorMessage,
    handleIdentifierChange,
    handlePasswordChange,
    handleLogIn,
    isSubmitting,
    isSubmitDisabled:
      identifier.trim().length === 0 || password.length === 0 || isSubmitting,
  };
}
