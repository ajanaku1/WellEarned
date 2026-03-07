import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MealAnalyzerScreen from './MealAnalyzerScreen';
import WorkoutCoachScreen from './WorkoutCoachScreen';
import MoodTrackerScreen from './MoodTrackerScreen';
import { palette, radius, spacing, type, button } from '@/theme/tokens';

type Tab = 'meal' | 'workout' | 'mood';

const tabs: { key: Tab; label: string }[] = [
  { key: 'meal', label: 'Meal' },
  { key: 'workout', label: 'Workout' },
  { key: 'mood', label: 'Mood' },
];

export default function LogScreen() {
  const [tab, setTab] = useState<Tab>('meal');

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ position: 'absolute', top: 120, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(123,188,197,0.04)' }} />

      <SafeAreaView style={{ flex: 1, paddingHorizontal: spacing.x5, paddingTop: spacing.x4 }}>
        <View style={{ marginBottom: spacing.x5 }}>
          <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }}>Capture</Text>
          <Text style={{ color: palette.inkSoft, fontSize: type.body, marginTop: 4 }}>Log with AI-powered analysis</Text>
        </View>

        {/* Tab Switcher — iOS segmented control style */}
        <View style={{
          flexDirection: 'row',
          gap: spacing.x2,
          marginBottom: spacing.x5,
          backgroundColor: 'rgba(240,237,232,0.04)',
          borderRadius: radius.pill,
          padding: 3,
          borderWidth: 0.5,
          borderColor: 'rgba(240,237,232,0.06)',
        }}>
          {tabs.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={{ flex: 1, paddingVertical: button.sm, borderRadius: radius.pill, overflow: 'hidden' }}
            >
              {tab === key ? (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: palette.brand }} />
              ) : null}
              <Text style={{ textAlign: 'center', color: tab === key ? '#fff' : palette.inkMuted, fontWeight: '600', fontSize: type.caption }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'meal' ? <MealAnalyzerScreen /> : null}
        {tab === 'workout' ? <WorkoutCoachScreen /> : null}
        {tab === 'mood' ? <MoodTrackerScreen /> : null}
      </SafeAreaView>
    </View>
  );
}
