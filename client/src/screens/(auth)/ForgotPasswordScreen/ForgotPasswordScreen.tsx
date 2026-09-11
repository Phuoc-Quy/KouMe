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

import { useForgotPasswordScreen } from './ForgotPasswordScreen.logic';
import { styles } from './ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen() {
  const {
    stage,
    email,
    otp,
    password,
    confirmPassword,
    errorMessage,
    passwordError,
    confirmPasswordError,
    handleEmailChange,
    handleOtpChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleRequestOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackPress,
    isSubmitting,
    isSubmitDisabled,
  } = useForgotPasswordScreen();

  const titles = {
    email: ['Forgot Password', 'Enter your email to reset your password.'],
    otp: ['Verify Email', 'Enter the code sent to your email.'],
    password: [
      'Create New Password',
      'Choose a new password for your account.',
    ],
  } as const;
  const [title, description] = titles[stage];
  const handleSubmit =
    stage === 'email'
      ? handleRequestOtp
      : stage === 'otp'
        ? handleVerifyOtp
        : handleResetPassword;

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

            {stage === 'password' ? (
              <View style={styles.passwordFields}>
                <TextField isRequired style={styles.field}>
                  <Label>New password</Label>
                  <Input
                    placeholder='Enter your new password'
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
                    placeholder='Repeat your new password'
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry
                    autoCapitalize='none'
                    autoCorrect={false}
                    returnKeyType='done'
                    onSubmitEditing={() => void handleSubmit()}
                  />
                </TextField>

                {passwordError || confirmPasswordError ? (
                  <Text style={styles.errorMessage}>
                    {passwordError ?? confirmPasswordError}
                  </Text>
                ) : null}
              </View>
            ) : null}

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
              onPress={() => void handleSubmit()}
            >
              <Button.Label style={styles.submitButtonLabel}>
                {isSubmitting
                  ? 'Submitting...'
                  : stage === 'email'
                    ? 'Send code'
                    : stage === 'otp'
                      ? 'Verify code'
                      : 'Reset password'}
              </Button.Label>
            </Button>
          </View>
        </ScreenLayout.Body>

        <ScreenLayout.Footer></ScreenLayout.Footer>
      </ScreenLayout>
    </Background>
  );
}
