import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  welcome: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  brand: {
    alignSelf: 'center',
    fontSize: 72,
  },
  action: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 16,
    width: '100%',
  },
  logInButton: {
    backgroundColor: colors.primary,
  },
  logInButtonLabel: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 2,
  },
  signUpButtonLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
  },
  forgotPasswordButtonLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
