import { LogOut } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { Button } from 'heroui-native';

import Background from '@/components/Background';
import ScreenLayout from '@/components/ScreenLayout';

import { useDashboardScreen } from './DashboardScreen.logic';
import { styles } from './DashboardScreen.styles';

export default function DashboardScreen() {
  const { username, errorMessage, isLoggingOut, handleLogout } =
    useDashboardScreen();

  return (
    <Background>
      <ScreenLayout>
        <ScreenLayout.Body>
          <View style={styles.content}>
            {username ? (
              <Text style={styles.welcome}>Welcome, {username}</Text>
            ) : (
              <Text style={styles.status}>
                {errorMessage ?? 'Loading your dashboard...'}
              </Text>
            )}

            <Button
              variant='secondary'
              isDisabled={isLoggingOut}
              style={styles.logoutButton}
              onPress={() => void handleLogout()}
            >
              <LogOut size={18} />
              <Button.Label>
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </Button.Label>
            </Button>
          </View>
        </ScreenLayout.Body>
      </ScreenLayout>
    </Background>
  );
}
