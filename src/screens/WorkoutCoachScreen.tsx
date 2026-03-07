import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { analyzeGemini } from '@/services/gemini';
import { uriToBase64, toGenerativePart } from '@/services/media';
import { FLASH } from '@/utils/models';
import { WORKOUT_SCHEMA } from '@/utils/schemas';
import { WORKOUT_ANALYSIS_PROMPT } from '@/utils/prompts';
import { useUserCollection } from '@/hooks/useUserCollection';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, button } from '@/theme/tokens';

export default function WorkoutCoachScreen() {
  const cameraRef = useRef<any>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [activeSession, setActiveSession] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useUserCollection('workouts');

  const startSession = async () => {
    if (!cameraPermission?.granted) { const p = await requestCameraPermission(); if (!p.granted) { setError('Camera permission is required.'); return; } }
    setActiveSession(true);
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setRecording(true); setError(null);
    try { const video = await cameraRef.current.recordAsync({ maxDuration: 20, quality: '480p' }); if (video?.uri) setVideoUri(video.uri); } catch (e: any) { setError(e?.message ?? 'Unable to record.'); } finally { setRecording(false); }
  };

  const stopRecording = () => { cameraRef.current?.stopRecording?.(); };

  const uploadVideo = async () => {
    const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });
    if (!pick.canceled) setVideoUri(pick.assets[0].uri);
  };

  const analyze = async () => {
    if (!videoUri) return;
    setLoading(true); setError(null);
    try {
      const base64 = await uriToBase64(videoUri);
      const data = await analyzeGemini(WORKOUT_ANALYSIS_PROMPT, [toGenerativePart(base64, 'video/mp4')], { model: FLASH, generationConfig: { responseMimeType: 'application/json', responseSchema: WORKOUT_SCHEMA } });
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      const coords = locationPermission.status === 'granted' ? await Location.getCurrentPositionAsync({}) : null;
      const payload = { ...data, workoutType: String(data.exercise_detected || 'gym').toLowerCase().includes('yoga') ? 'yoga' : String(data.exercise_detected || 'gym').toLowerCase().includes('run') ? 'run' : 'gym', duration: 20, formScore: data.form_score, lat: coords?.coords?.latitude ?? null, lng: coords?.coords?.longitude ?? null };
      await addItem(payload); setResult(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { setError(e?.message ?? 'Workout analysis failed.'); } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.x4, paddingBottom: 60 }}>
      {!activeSession ? (
        <Pressable onPress={startSession} style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient colors={gradient.brand} style={{ paddingVertical: button.lg, borderRadius: radius.lg }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: type.body }}>Start Camera Session</Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <View style={{ borderRadius: radius.xl, overflow: 'hidden', height: 280, ...shadow.md, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} mode="video" facing="front" />
          <View style={{ position: 'absolute', left: spacing.x4, right: spacing.x4, bottom: spacing.x4 }}>
            <Pressable onPress={recording ? stopRecording : startRecording} style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: pressed ? 0.85 : 1 })}>
              <LinearGradient colors={recording ? (gradient.danger) : (gradient.mint)} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>{recording ? 'Stop Recording' : 'Record'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
          {recording && (
            <View style={{ position: 'absolute', top: spacing.x4, right: spacing.x4, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(207,113,113,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette.danger }} />
              <Text style={{ color: '#fff', fontSize: type.micro, fontWeight: '700' }}>REC</Text>
            </View>
          )}
        </View>
      )}

      <Pressable onPress={uploadVideo} style={({ pressed }) => ({ backgroundColor: 'rgba(240,237,232,0.05)', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.08)', borderRadius: radius.lg, paddingVertical: button.md, opacity: pressed ? 0.85 : 1 })}>
        <Text style={{ textAlign: 'center', fontWeight: '600', color: palette.ink, fontSize: type.body }}>Upload Video</Text>
      </Pressable>

      <Pressable onPress={analyze} disabled={!videoUri || loading} style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: !videoUri || loading ? 0.35 : pressed ? 0.85 : 1 })}>
        <LinearGradient colors={!videoUri || loading ? [palette.surfaceMuted, palette.surfaceMuted] : (gradient.brand)} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
          <Text style={{ color: !videoUri || loading ? palette.inkMuted : '#fff', textAlign: 'center', fontWeight: '700', fontSize: type.body }}>{loading ? 'Analyzing with Gemini...' : 'Analyze Workout'}</Text>
        </LinearGradient>
      </Pressable>

      {error ? <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}><Text style={{ color: palette.danger, fontSize: type.caption }}>{error}</Text></View> : null}

      {result ? (
        <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderRadius: radius.xl, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)', padding: spacing.x5, gap: spacing.x3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', color: palette.ink, fontSize: type.subtitle }}>{result.exercise_detected}</Text>
            <View style={{ borderRadius: radius.pill, backgroundColor: (result.form_score ?? 0) >= 7 ? palette.mintGlow : palette.amberGlow, paddingHorizontal: spacing.x4, paddingVertical: 6 }}>
              <Text style={{ color: (result.form_score ?? 0) >= 7 ? palette.mint : palette.amber, fontWeight: '700', fontSize: type.caption }}>{result.form_score}/10</Text>
            </View>
          </View>
          {(result.form_feedback || []).slice(0, 3).map((item: string, idx: number) => (
            <View key={`${item}-${idx}`} style={{ flexDirection: 'row', gap: spacing.x3, alignItems: 'flex-start' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.brand, marginTop: 7 }} />
              <Text style={{ color: palette.inkSoft, fontSize: type.body, flex: 1, lineHeight: 22 }}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
