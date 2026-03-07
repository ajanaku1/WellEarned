import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { RecordingOptionsPresets } from 'expo-av/build/Audio';
import { analyzeGemini } from '@/services/gemini';
import { uriToBase64, toGenerativePart } from '@/services/media';
import { FLASH } from '@/utils/models';
import { MOOD_SCHEMA } from '@/utils/schemas';
import { MOOD_ANALYSIS_PROMPT, MOOD_TEXT_PROMPT } from '@/utils/prompts';
import { useUserCollection } from '@/hooks/useUserCollection';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, button, row } from '@/theme/tokens';

export default function MoodTrackerScreen() {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [journal, setJournal] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const moodAnim = useMemo(() => new Animated.Value(0), []);
  const { addItem } = useUserCollection('moods');

  useEffect(() => {
    Animated.timing(moodAnim, { toValue: result?.mood_score ?? 0, duration: 600, useNativeDriver: false }).start();
  }, [result?.mood_score, moodAnim]);

  const startRecording = async () => {
    setError(null);
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) { setError('Microphone permission is required.'); return; }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setRecording(rec);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setRecording(null);
  };

  const analyze = async () => {
    setLoading(true); setError(null);
    try {
      let data;
      if (mode === 'voice' && audioUri) {
        const base64 = await uriToBase64(audioUri);
        data = await analyzeGemini(MOOD_ANALYSIS_PROMPT, [toGenerativePart(base64, 'audio/m4a')], { model: FLASH, generationConfig: { responseMimeType: 'application/json', responseSchema: MOOD_SCHEMA } });
      } else if (mode === 'text' && journal.trim()) {
        data = await analyzeGemini(MOOD_TEXT_PROMPT.replace('{text}', journal), [], { model: FLASH, generationConfig: { responseMimeType: 'application/json', responseSchema: MOOD_SCHEMA } });
      } else { return; }
      setResult(data); await addItem(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { setError(e?.message ?? 'Mood analysis failed.'); } finally { setLoading(false); }
  };

  const indicatorWidth = moodAnim.interpolate({ inputRange: [0, 10], outputRange: ['0%', '100%'] });
  const moodColor = (s: number) => s >= 7 ? palette.mint : s >= 4 ? palette.amber : palette.danger;
  const moodGrad = (s: number): readonly [string, string] => s >= 7 ? gradient.mint : s >= 4 ? gradient.amber : gradient.danger;

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.x4, paddingBottom: 60 }}>
      {/* Mode Switcher */}
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(240,237,232,0.04)', borderRadius: radius.pill, padding: 3, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
        {(['voice', 'text'] as const).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: button.sm, borderRadius: radius.pill, overflow: 'hidden' }}>
            {mode === m ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: palette.brand }} /> : null}
            <Text style={{ textAlign: 'center', color: mode === m ? '#fff' : palette.inkMuted, fontWeight: '600', fontSize: type.caption }}>
              {m === 'voice' ? 'Voice' : 'Journal'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Input */}
      {mode === 'voice' ? (
        <Pressable
          onPress={recording ? stopRecording : startRecording}
          style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: pressed ? 0.85 : 1 })}
        >
          <LinearGradient colors={recording ? (gradient.danger) : (gradient.calm)} style={{ paddingVertical: button.lg, borderRadius: radius.lg, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: type.body }}>
              {recording ? 'Stop Recording' : audioUri ? 'Re-record' : 'Start Recording'}
            </Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <TextInput
          value={journal}
          onChangeText={setJournal}
          placeholder="Write how you feel today..."
          placeholderTextColor={palette.inkMuted}
          multiline
          style={{ minHeight: 140, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.08)', borderRadius: radius.xl, padding: spacing.x5, textAlignVertical: 'top', fontSize: 16, color: palette.ink, backgroundColor: 'rgba(240,237,232,0.03)', lineHeight: 24 }}
        />
      )}

      {audioUri && mode === 'voice' ? (
        <View style={{ borderRadius: radius.lg, backgroundColor: palette.mintSurface, padding: spacing.x4, alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(142,207,165,0.2)' }}>
          <Text style={{ color: palette.mint, fontSize: type.caption, fontWeight: '600' }}>Audio recorded and ready</Text>
        </View>
      ) : null}

      <Pressable onPress={analyze} disabled={loading} style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: loading ? 0.4 : pressed ? 0.85 : 1 })}>
        <LinearGradient colors={loading ? [palette.surfaceMuted, palette.surfaceMuted] : (gradient.brand)} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
          <Text style={{ color: loading ? palette.inkMuted : '#fff', textAlign: 'center', fontWeight: '700', fontSize: type.body }}>
            {loading ? 'Analyzing with Gemini...' : 'Analyze Mood'}
          </Text>
        </LinearGradient>
      </Pressable>

      {error ? <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}><Text style={{ color: palette.danger, fontSize: type.caption }}>{error}</Text></View> : null}

      {result ? (
        <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderRadius: radius.xl, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)', padding: spacing.x5, gap: spacing.x5 }}>
          <Text style={{ fontWeight: '700', color: palette.ink, fontSize: type.subtitle }}>{result.summary}</Text>

          {/* Score Bar */}
          <View style={{ gap: spacing.x2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>Mood Score</Text>
              <Text style={{ color: moodColor(result.mood_score ?? 0), fontWeight: '700', fontSize: type.body }}>{result.mood_score}/10</Text>
            </View>
            <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: 'rgba(240,237,232,0.04)', overflow: 'hidden' }}>
              <Animated.View style={{ height: 8, width: indicatorWidth, borderRadius: radius.pill, overflow: 'hidden' }}>
                <LinearGradient colors={moodGrad(result.mood_score ?? 0)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              </Animated.View>
            </View>
          </View>

          {/* Tip */}
          <View style={{ backgroundColor: 'rgba(240,237,232,0.03)', borderRadius: radius.lg, padding: spacing.x4, gap: spacing.x2, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
            <Text style={{ color: palette.brandLight, fontWeight: '600', fontSize: type.caption }}>Wellness Tip</Text>
            <Text style={{ color: palette.inkSoft, fontSize: type.body, lineHeight: 22 }}>{result.wellness_tip}</Text>
          </View>

          {/* Affirmation */}
          <View style={{ borderRadius: radius.lg, backgroundColor: palette.lavenderSurface, padding: spacing.x5, borderWidth: 0.5, borderColor: 'rgba(165,148,201,0.15)' }}>
            <Text style={{ color: palette.lavender, fontSize: type.body, fontStyle: 'italic', lineHeight: 22 }}>"{result.affirmation}"</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
