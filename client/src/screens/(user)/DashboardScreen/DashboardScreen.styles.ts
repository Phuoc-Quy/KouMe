import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  welcome: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  status: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
});
