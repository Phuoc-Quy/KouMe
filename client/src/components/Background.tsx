import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { palette } from '@/theme/colors';

type BackgroundProps = PropsWithChildren;

export default function Background({ children }: BackgroundProps) {
  return (
    <LinearGradient
      colors={[palette.yellowHint, palette.freshGreen]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
