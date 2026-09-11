import { Button } from 'heroui-native';
import { Text, View } from 'react-native';

import Background from '@/components/Background';
import Brand from '@/components/Brand';
import ScreenLayout from '@/components/ScreenLayout';

import {
  handleForgotPasswordPress,
  handleLogInPress,
  handleSignUpPress,
} from './LandingScreen.logic';
import { styles } from './LandingScreen.styles';

export default function LandingScreen() {
  return (
    <Background>
      <ScreenLayout>
        <ScreenLayout.Header></ScreenLayout.Header>

        <ScreenLayout.Body>
          <View style={styles.hero}>
            <Text style={styles.welcome}>Welcome to</Text>
            <Brand style={styles.brand} />
          </View>

          <View style={styles.action}>
            <Button
              variant='primary'
              size='lg'
              style={[styles.button, styles.logInButton]}
              onPress={handleLogInPress}
            >
              <Button.Label style={styles.logInButtonLabel}>
                Log in
              </Button.Label>
            </Button>

            <Button
              variant='secondary'
              size='lg'
              style={[styles.button, styles.signUpButton]}
              onPress={handleSignUpPress}
            >
              <Button.Label style={styles.signUpButtonLabel}>
                Sign up
              </Button.Label>
            </Button>

            <Button
              variant='ghost'
              style={styles.forgotPasswordButton}
              onPress={handleForgotPasswordPress}
            >
              <Button.Label style={styles.forgotPasswordButtonLabel}>
                Forgot password?
              </Button.Label>
            </Button>
          </View>
        </ScreenLayout.Body>

        <ScreenLayout.Footer style={styles.footer}>
          <Text style={styles.footerText}>Powered by Win's Studio</Text>
          <Text style={styles.footerText}>
            © 2026 Koume. All rights reserved.
          </Text>
        </ScreenLayout.Footer>
      </ScreenLayout>
    </Background>
  );
}
