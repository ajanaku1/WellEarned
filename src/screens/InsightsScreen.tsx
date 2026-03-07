import { Component, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
// MapView disabled — requires Google Maps API key in AndroidManifest to avoid native crash
const MapView: any = null;
const Marker: any = null;
import { useUserCollection } from '@/hooks/useUserCollection';
import { analyzeGemini } from '@/services/gemini';
import { FLASH } from '@/utils/models';
import { CROSS_FEATURE_INSIGHTS_PROMPT, WEEKLY_SUMMARY_PROMPT } from '@/utils/prompts';
import { INSIGHTS_SCHEMA } from '@/utils/schemas';
import { classifyWorkoutLocations } from '@/utils/workoutLocation';
import { palette, gradient, radius, spacing, type, shadow, card, glowCard, button } from '@/theme/tokens';

const chartConfig = {
  backgroundGradientFrom: 'transparent',
  backgroundGradientTo: 'transparent',
  color: (opacity = 1) => `rgba(123, 175, 142, ${opacity})`,
  labelColor: () => palette.inkMuted,
  strokeWidth: 2.5,
  decimalPlaces: 0,
  propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(240,237,232,0.04)' },
  propsForDots: { r: '5', strokeWidth: '2.5', stroke: '#7BAF8E', fill: palette.bg },
};

const markerColor = (t: string) => t === 'run' ? palette.brand : t === 'yoga' ? palette.lavender : palette.amber;

export default function InsightsScreen() {
  const { items: meals } = useUserCollection('meals');
  const { items: workouts } = useUserCollection('workouts');
  const { items: moods } = useUserCollection('moods');
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);
  const [weeklySummaryLoading, setWeeklySummaryLoading] = useState(false);
  const width = Dimensions.get('window').width - 40;

  const streak = useMemo(() => {
    let n = 0; const now = new Date();
    while (n < 365) {
      const d = new Date(now); d.setDate(now.getDate() - n);
      const key = d.toISOString().slice(0, 10);
      if (!meals.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      if (!workouts.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      if (!moods.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      n += 1;
    }
    return n;
  }, [meals, workouts, moods]);

  const moodChart = useMemo(() => {
    const points = moods.slice(0, 7).reverse().map((x) => x.mood_score || 0);
    const hasPoints = points.length > 0;
    return { labels: hasPoints ? points.map((_, i) => `D${i + 1}`) : ['D1'], datasets: [{ data: hasPoints ? points : [0] }] };
  }, [moods]);

  const locatedWorkouts = useMemo(() => classifyWorkoutLocations(workouts.filter((w) => w.lat && w.lng)), [workouts]);

  const generateInsights = async () => {
    setLoading(true); setError(null);
    try {
      const payload = { meals: meals.slice(0, 14), workouts: locatedWorkouts.slice(0, 14), moods: moods.slice(0, 14) };
      const textPrompt = CROSS_FEATURE_INSIGHTS_PROMPT.replace('{data}', JSON.stringify(payload));
      const data = await analyzeGemini(textPrompt, [], { model: FLASH, generationConfig: { responseMimeType: 'application/json', responseSchema: INSIGHTS_SCHEMA } });
      setInsights(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate insights.');
    } finally { setLoading(false); }
  };

  const generateWeeklySummary = async () => {
    setWeeklySummaryLoading(true);
    try {
      const data = JSON.stringify({ meals: meals.slice(0, 7), workouts: workouts.slice(0, 7), moods: moods.slice(0, 7) });
      const result = await analyzeGemini(WEEKLY_SUMMARY_PROMPT.replace('{data}', data), [], { model: FLASH });
      setWeeklySummary(typeof result === 'string' ? result : result?.text || JSON.stringify(result));
    } catch {} finally { setWeeklySummaryLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ position: 'absolute', top: -30, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(123,175,142,0.05)' }} />
      <View style={{ position: 'absolute', bottom: 120, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(165,148,201,0.04)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.x5, gap: spacing.x5, paddingBottom: 100 }}>
          <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }}>Insights</Text>

          {/* Consistency */}
          <View style={{ ...glowCard(streak > 0 ? palette.brand : 'rgba(240,237,232,0.06)') }}>
            <Text style={{ color: palette.inkMuted, fontSize: type.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 }}>Consistency</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.x2, marginTop: 4 }}>
              <Text style={{ fontSize: 40, fontWeight: '700', color: palette.brand }}>{streak}</Text>
              <Text style={{ color: palette.inkSoft, fontSize: type.body }}>day streak</Text>
            </View>
          </View>

          {/* Weekly Summary */}
          <View style={{ ...card, gap: spacing.x4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.lavender }} />
                <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Weekly Summary</Text>
                <View style={{ backgroundColor: palette.lavenderSurface, paddingHorizontal: spacing.x3, paddingVertical: 3, borderRadius: radius.pill }}>
                  <Text style={{ color: palette.lavender, fontSize: type.micro, fontWeight: '600' }}>AI</Text>
                </View>
              </View>
              <Pressable
                onPress={generateWeeklySummary}
                disabled={weeklySummaryLoading}
                style={({ pressed }) => ({ borderRadius: radius.pill, overflow: 'hidden', opacity: weeklySummaryLoading ? 0.5 : pressed ? 0.7 : 1 })}
              >
                <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: spacing.x5, paddingVertical: button.sm, borderRadius: radius.pill }}>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: type.caption }}>{weeklySummaryLoading ? 'Generating...' : 'Generate'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
            {weeklySummary ? (
              <Text style={{ color: palette.inkSoft, fontSize: type.body, lineHeight: 22 }}>{weeklySummary}</Text>
            ) : (
              <View style={{ backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: radius.lg, padding: spacing.x6, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.05)' }}>
                <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Tap Generate for your weekly wellness summary</Text>
              </View>
            )}
          </View>

          {/* Mood Chart */}
          <View style={{ ...card }}>
            <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink, marginBottom: spacing.x4 }}>Mood Curve</Text>
            <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
              <LineChart data={moodChart} width={width - 32} height={200} chartConfig={chartConfig} bezier style={{ borderRadius: radius.lg }} withVerticalLines={false} />
            </View>
          </View>

          {/* Movement Map */}
          <View style={{ ...card, gap: spacing.x3 }}>
            <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Movement Map</Text>
            <MapErrorBoundary fallback={
              <View style={{ backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: radius.lg, padding: spacing.x6, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.05)' }}>
                <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Map unavailable on this device</Text>
              </View>
            }>
              {locatedWorkouts.length > 0 && MapView ? (
                <View style={{ height: 240, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
                  <MapView style={{ flex: 1 }} initialRegion={{ latitude: locatedWorkouts[0]?.lat || 37.7749, longitude: locatedWorkouts[0]?.lng || -122.4194, latitudeDelta: 0.07, longitudeDelta: 0.07 }}>
                    {locatedWorkouts.map((w) => (
                      <Marker key={w.id} coordinate={{ latitude: w.lat, longitude: w.lng }} title={w.exercise_detected || w.workoutType || 'Workout'} pinColor={markerColor(w.workoutType)} />
                    ))}
                  </MapView>
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: radius.lg, padding: spacing.x6, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.05)' }}>
                  <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Log a workout with location to see your map</Text>
                </View>
              )}
            </MapErrorBoundary>
          </View>

          {/* AI Insights */}
          <View style={{ ...card, gap: spacing.x4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>AI Insights</Text>
              <Pressable
                onPress={generateInsights}
                disabled={loading}
                style={({ pressed }) => ({ borderRadius: radius.pill, overflow: 'hidden', opacity: loading ? 0.5 : pressed ? 0.7 : 1 })}
              >
                <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: spacing.x5, paddingVertical: button.sm, borderRadius: radius.pill }}>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: type.caption }}>{loading ? 'Analyzing...' : 'Generate'}</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {error ? <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}><Text style={{ color: palette.danger, fontSize: type.caption }}>{error}</Text></View> : null}

            {insights.length === 0 && !loading ? (
              <View style={{ backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: radius.lg, padding: spacing.x6, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.05)' }}>
                <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Tap Generate for AI-powered insights</Text>
              </View>
            ) : null}

            {insights.map((insight, idx) => (
              <View key={`${insight.title}-${idx}`} style={{ backgroundColor: palette.brandSurface, borderRadius: radius.lg, padding: spacing.x5, gap: 6, borderWidth: 0.5, borderColor: 'rgba(123,175,142,0.12)' }}>
                <Text style={{ fontWeight: '600', color: palette.ink, fontSize: type.body }}>{insight.title}</Text>
                <Text style={{ color: palette.inkSoft, fontSize: type.caption, lineHeight: 19 }}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
