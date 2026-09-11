import { StyleSheet, Text } from 'react-native';
import type { TextProps } from 'react-native';

import { palette } from '@/theme/colors';

type BrandProps = Omit<TextProps, 'children'>;

export default function Brand({ style, ...props }: BrandProps) {
  return (
    <Text {...props} style={[styles.brand, style, styles.kou]}>
      Kou
      <Text style={styles.me}>me</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignSelf: 'center',
    fontSize: 72,
    fontWeight: '700',
  },
  kou: {
    color: palette.samara,
  },
  me: {
    color: palette.brownishPink,
  },
});
