import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  brand: {
    position: 'absolute',
    left: 0,
    right: 0,
    fontSize: 42,
    textAlign: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    marginTop: 8,
  },
  action: {
    flex: 3,
    gap: 20,
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  field: {
    width: '100%',
  },
  errorMessage: {
    color: '#B42318',
    fontSize: 14,
    marginTop: -12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: '100%',
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
