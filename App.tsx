import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from '@/navigation/AppNavigator';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ActivityIndicator, Text, View } from 'react-native';
import { setupPushNotifications } from '@/services/notifications';
import { registerDailyNotificationTask } from '@/tasks/dailyNotifications';
import AuthScreen from '@/screens/AuthScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { palette, shadow } from '@/theme/tokens';
import WellEarnedLogo from '@/components/WellEarnedLogo';

const ONBOARDING_KEY = 'wellearned_onboarded';

function AppBootstrap() {
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    registerDailyNotificationTask().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    setupPushNotifications(user.uid).catch(() => {});
  }, [user?.uid]);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setOnboarded(v === 'true')).catch(() => setOnboarded(false));
  }, []);

  const completeOnboarding = () => {
    setOnboarded(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  };

  if (loading || onboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg, gap: 24 }}>
        <View style={{ position: 'absolute', top: '25%', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(123, 175, 142, 0.06)' }} />
        <View style={{ position: 'absolute', bottom: '20%', left: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(165, 148, 201, 0.04)' }} />
        <View style={shadow.softGlow(palette.brand)}>
          <WellEarnedLogo size={72} />
        </View>
        <ActivityIndicator size="large" color={palette.brand} />
        <Text style={{ color: palette.inkSoft, fontSize: 15 }}>Preparing your wellness space...</Text>
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  if (!onboarded) return <OnboardingScreen onComplete={completeOnboarding} />;

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <AppBootstrap />
        </WalletProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
