import { Button, Input, Label, TextField } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text, View } from 'react-native';

import Background from '@/components/Background';
import Brand from '@/components/Brand';
import ScreenLayout from '@/components/ScreenLayout';

import { handleBackPress, useLogInScreen } from './LogInScreen.logic';
import { styles } from './LogInScreen.styles';

export default function LogInScreen() {
  const {
    identifier,
    password,
    errorMessage,
    handleIdentifierChange,
    handlePasswordChange,
    handleLogIn,
    isSubmitting,
    isSubmitDisabled,
  } = useLogInScreen();

  return (
    <Background>
      <ScreenLayout>
        <ScreenLayout.Header style={styles.header}>
          <Button
            isIconOnly
            variant='ghost'
            accessibilityLabel='Go back'
            onPress={handleBackPress}
          >
            <ChevronLeft />
          </Button>

          <Brand pointerEvents='none' style={styles.brand} />
        </ScreenLayout.Header>

        <ScreenLayout.Body>
          <View style={styles.hero}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Please enter your details to log in.
            </Text>
          </View>

          <View style={styles.action}>
            <TextField isRequired style={styles.field}>
              <Label>Username or email</Label>
              <Input
                placeholder='Enter your username or email'
                value={identifier}
                onChangeText={handleIdentifierChange}
                autoCapitalize='none'
                autoCorrect={false}
                autoComplete='username'
                textContentType='username'
                returnKeyType='next'
              />
            </TextField>

            <TextField isRequired style={styles.field}>
              <Label>Password</Label>
              <Input
                placeholder='Enter your password'
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                autoCapitalize='none'
                autoCorrect={false}
                autoComplete='current-password'
                textContentType='password'
                returnKeyType='done'
                onSubmitEditing={() => void handleLogIn()}
              />
            </TextField>

            {errorMessage ? (
              <Text accessibilityRole='alert' style={styles.errorMessage}>
                {errorMessage}
              </Text>
            ) : null}

            <Button
              variant='primary'
              size='lg'
              isDisabled={isSubmitDisabled}
              style={styles.submitButton}
              onPress={() => void handleLogIn()}
            >
              <Button.Label style={styles.submitButtonLabel}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button.Label>
            </Button>
          </View>
        </ScreenLayout.Body>

        <ScreenLayout.Footer></ScreenLayout.Footer>
      </ScreenLayout>
    </Background>
  );
}
