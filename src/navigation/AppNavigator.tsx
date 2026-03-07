import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
import LogScreen from '@/screens/LogScreen';
import RewardsScreen from '@/screens/RewardsScreen';
import InsightsScreen from '@/screens/InsightsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import AppIcon from '@/components/AppIcon';
import { palette, radius } from '@/theme/tokens';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        id="main-tabs"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: 75,
            paddingBottom: 14,
            paddingTop: 8,
            backgroundColor: 'rgba(22, 27, 24, 0.92)',
            borderTopColor: 'rgba(240, 237, 232, 0.06)',
            borderTopWidth: 0.5,
          },
          tabBarActiveTintColor: palette.brand,
          tabBarInactiveTintColor: palette.inkMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 2,
          },
          tabBarItemStyle: {
            borderRadius: radius.sm,
            marginHorizontal: 2,
          },
          tabBarIcon: ({ focused }) => {
            const iconName = route.name.toLowerCase() as any;
            return (
              <View style={{ alignItems: 'center' }}>
                {focused && (
                  <View style={{
                    position: 'absolute',
                    top: -6,
                    width: 20,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: palette.brand,
                    opacity: 0.8,
                  }} />
                )}
                <AppIcon name={iconName} active={focused} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Log" component={LogScreen} options={{ title: 'Capture' }} />
        <Tab.Screen name="Rewards" component={RewardsScreen} options={{ title: 'Rewards' }} />
        <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
