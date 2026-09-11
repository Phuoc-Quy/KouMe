import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

const ACCESS_TOKEN_KEY = 'koume.access-token';
const REFRESH_TOKEN_KEY = 'koume.refresh-token';
const authsApiUrl = process.env.EXPO_PUBLIC_AUTHS_API_URL;
const usersApiUrl = process.env.EXPO_PUBLIC_USERS_API_URL;

type CurrentUser = {
  username: string;
};

export function useDashboardScreen() {
  const [username, setUsername] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (refreshToken && authsApiUrl) {
        await fetch(`${authsApiUrl}/auth/log-out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      router.replace('/landing');
    }
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

        if (!accessToken || !usersApiUrl) {
          throw new Error('Unable to load your account');
        }

        const response = await fetch(`${usersApiUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unable to load your account');
        }

        const user = (await response.json()) as CurrentUser;
        setUsername(user.username);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load your account',
        );
      }
    };

    void loadCurrentUser();
  }, []);

  return {
    username,
    errorMessage,
    isLoggingOut,
    handleLogout,
  };
}
