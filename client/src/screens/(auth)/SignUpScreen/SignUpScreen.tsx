import {
  Button,
  Input,
  InputOTP,
  Label,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  TextField,
} from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text, View } from 'react-native';

import Background from '@/components/Background';
import Brand from '@/components/Brand';
import ScreenLayout from '@/components/ScreenLayout';

import { useSignUpScreen } from './SignUpScreen.logic';
import { styles } from './SignUpScreen.styles';

export default function SignUpScreen() {
  const {
    stage,
    email,
    otp,
    username,
    password,
    confirmPassword,
    errorMessage,
    accountValidationError,
    handleEmailChange,
    handleOtpChange,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleRequestOtp,
    handleVerifyOtp,
    handleCreateAccount,
    handleBackPress,
    isSubmitting,
    isSubmitDisabled,
  } = useSignUpScreen();

  const titles = {
    email: ['Create Account', 'Enter your email to get started.'],
    otp: ['Verify Email', 'Enter the code sent to your email.'],
    account: ['Finish Account', 'Choose your username and password.'],
  } as const;

  const [title, description] = titles[stage];

  const handleSubmit =
    stage === 'email'
      ? handleRequestOtp
      : stage === 'otp'
        ? handleVerifyOtp
        : handleCreateAccount;

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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View style={styles.action}>
            {stage === 'email' ? (
              <TextField isRequired style={styles.field}>
                <Label>Email</Label>
                <Input
                  placeholder='Enter your email'
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  autoComplete='email'
                  textContentType='emailAddress'
                  returnKeyType='done'
                  onSubmitEditing={() => void handleSubmit()}
                />
              </TextField>
            ) : null}

            {stage === 'otp' ? (
              <View style={styles.otpField}>
                <Text style={styles.fieldLabel}>Verification code</Text>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  onComplete={(value) => void handleVerifyOtp(value)}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  inputMode='text'
                  isInvalid={Boolean(errorMessage)}
                >
                  <InputOTP.Group>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTP.Slot key={index} index={index} />
                    ))}
                  </InputOTP.Group>
                </InputOTP>
              </View>
            ) : null}

            {stage === 'account' ? (
              <View style={styles.accountFields}>
                <TextField isRequired style={styles.field}>
                  <Label>Username</Label>
                  <Input
                    placeholder='Choose a username'
                    value={username}
                    onChangeText={handleUsernameChange}
                    autoCapitalize='none'
                    autoCorrect={false}
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
                  />
                </TextField>

                <TextField isRequired style={styles.field}>
                  <Label>Confirm password</Label>
                  <Input
                    placeholder='Repeat your password'
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry
                    autoCapitalize='none'
                    autoCorrect={false}
                    returnKeyType='done'
                    onSubmitEditing={() => void handleSubmit()}
                  />
                </TextField>
              </View>
            ) : null}

            {errorMessage || accountValidationError ? (
              <Text accessibilityRole='alert' style={styles.errorMessage}>
                {errorMessage ?? accountValidationError}
              </Text>
            ) : null}

            <Button
              variant='primary'
              size='lg'
              isDisabled={isSubmitDisabled}
              style={styles.submitButton}
              onPress={() => void handleSubmit()}
            >
              <Button.Label style={styles.submitButtonLabel}>
                {isSubmitting
                  ? 'Submitting...'
                  : stage === 'email'
                    ? 'Send code'
                    : stage === 'otp'
                      ? 'Verify code'
                      : 'Create account'}
              </Button.Label>
            </Button>
          </View>
        </ScreenLayout.Body>

        <ScreenLayout.Footer></ScreenLayout.Footer>
      </ScreenLayout>
    </Background>
  );
}
