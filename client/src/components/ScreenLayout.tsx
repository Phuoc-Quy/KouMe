import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SectionProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

function Header({ children, style }: SectionProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

function Body({ children, style }: SectionProps) {
  return <View style={[styles.body, style]}>{children}</View>;
}

function Footer({ children, style }: SectionProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

function ScreenLayout({ children }: PropsWithChildren) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

ScreenLayout.Header = Header;
ScreenLayout.Body = Body;
ScreenLayout.Footer = Footer;

export default ScreenLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
  },
  body: {
    flex: 1,
  },
  footer: {
    height: 60,
  },
});
