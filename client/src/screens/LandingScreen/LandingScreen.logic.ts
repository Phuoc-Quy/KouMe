import { router } from 'expo-router';

export function handleLogInPress() {
  router.push('/(auth)/log-in');
}

export function handleSignUpPress() {
  router.push('/(auth)/sign-up');
}

export function handleForgotPasswordPress() {
  router.push('/(auth)/forgot-password');
}
