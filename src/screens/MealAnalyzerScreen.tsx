import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { analyzeGemini } from '@/services/gemini';
import { uriToBase64, toGenerativePart } from '@/services/media';
import { FLASH } from '@/utils/models';
import { MEAL_SCHEMA } from '@/utils/schemas';
import { MEAL_ANALYSIS_PROMPT } from '@/utils/prompts';
import { useUserCollection } from '@/hooks/useUserCollection';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, button } from '@/theme/tokens';

export default function MealAnalyzerScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useUserCollection('meals');

  const captureFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') { setError('Camera permission is required.'); return; }
    const shot = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8, mediaTypes: ['images'] });
    if (!shot.canceled) { setPhotoUri(shot.assets[0].uri); setResult(null); }
  };

  const pickFromLibrary = async () => {
    const pick = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] });
    if (!pick.canceled) { setPhotoUri(pick.assets[0].uri); setResult(null); }
  };

  const analyze = async () => {
    if (!photoUri) return;
    setLoading(true); setError(null);
    try {
      const base64 = await uriToBase64(photoUri);
      const data = await analyzeGemini(MEAL_ANALYSIS_PROMPT, [toGenerativePart(base64, 'image/jpeg')], { model: FLASH, generationConfig: { responseMimeType: 'application/json', responseSchema: MEAL_SCHEMA } });
      setResult(data); await addItem(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) { setError(e?.message ?? 'Failed to analyze meal.'); } finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 7 ? palette.mint : s >= 4 ? palette.amber : palette.danger;

  return (
    <ScrollView contentContainerStyle={{ gap: spacing.x4, paddingBottom: 60 }}>
      <View style={{ flexDirection: 'row', gap: spacing.x3 }}>
        <Pressable onPress={captureFromCamera} style={({ pressed }) => ({ flex: 1, borderRadius: radius.lg, overflow: 'hidden', opacity: pressed ? 0.85 : 1 })}>
          <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: type.body }}>Camera</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={pickFromLibrary} style={({ pressed }) => ({ flex: 1, backgroundColor: 'rgba(240,237,232,0.05)', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.08)', borderRadius: radius.lg, paddingVertical: button.md, opacity: pressed ? 0.85 : 1 })}>
          <Text style={{ color: palette.ink, textAlign: 'center', fontWeight: '600', fontSize: type.body }}>Gallery</Text>
        </Pressable>
      </View>

      {photoUri ? (
        <View style={{ borderRadius: radius.xl, overflow: 'hidden', ...shadow.sm, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: 220 }} />
        </View>
      ) : (
        <View style={{ backgroundColor: 'rgba(240,237,232,0.02)', borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(240,237,232,0.06)', borderStyle: 'dashed', height: 160, alignItems: 'center', justifyContent: 'center', gap: spacing.x2 }}>
          <Text style={{ color: palette.inkMuted, fontSize: 28 }}>&#128247;</Text>
          <Text style={{ color: palette.inkMuted, fontSize: type.caption }}>Take or upload a meal photo</Text>
        </View>
      )}

      <Pressable onPress={analyze} disabled={!photoUri || loading} style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: !photoUri || loading ? 0.35 : pressed ? 0.85 : 1 })}>
        <LinearGradient colors={!photoUri || loading ? [palette.surfaceMuted, palette.surfaceMuted] : (gradient.brand)} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
          <Text style={{ color: !photoUri || loading ? palette.inkMuted : '#fff', textAlign: 'center', fontWeight: '700', fontSize: type.body }}>
            {loading ? 'Analyzing with Gemini...' : 'Analyze Meal'}
          </Text>
        </LinearGradient>
      </Pressable>

      {error ? <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}><Text style={{ color: palette.danger, fontSize: type.caption }}>{error}</Text></View> : null}

      {result ? (
        <View style={{ gap: spacing.x4 }}>
          <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderRadius: radius.xl, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)', padding: spacing.x5, gap: spacing.x3 }}>
            <Text style={{ fontWeight: '700', fontSize: type.subtitle, color: palette.ink }}>{result.meal_name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x2 }}>
              <View style={{ backgroundColor: `${scoreColor(result.health_score ?? 0)}20`, paddingHorizontal: spacing.x4, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 0.5, borderColor: `${scoreColor(result.health_score ?? 0)}35` }}>
                <Text style={{ color: scoreColor(result.health_score ?? 0), fontWeight: '700', fontSize: type.body }}>{result.health_score}/10</Text>
              </View>
              <Text style={{ color: palette.inkSoft, fontSize: type.caption }}>health score</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.x2 }}>
            {[
              { label: 'Cal', value: result.nutrition?.calories, color: palette.brand },
              { label: 'Protein', value: `${result.nutrition?.protein_g}g`, color: palette.mint },
              { label: 'Carbs', value: `${result.nutrition?.carbs_g}g`, color: palette.amber },
              { label: 'Fat', value: `${result.nutrition?.fat_g}g`, color: palette.danger },
            ].map((n) => (
              <View key={n.label} style={{ flex: 1, borderRadius: radius.lg, backgroundColor: 'rgba(28, 35, 32, 0.7)', borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)', padding: spacing.x3, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontWeight: '700', color: n.color, fontSize: type.body }}>{n.value}</Text>
                <Text style={{ color: palette.inkMuted, fontSize: type.micro, fontWeight: '600' }}>{n.label}</Text>
              </View>
            ))}
          </View>

          {(result.healthier_swaps || []).length > 0 ? (
            <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderRadius: radius.xl, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)', padding: spacing.x5, gap: spacing.x3 }}>
              <Text style={{ fontWeight: '600', color: palette.ink, fontSize: type.body }}>Healthier Swaps</Text>
              {result.healthier_swaps.map((swap: string, idx: number) => (
                <View key={`${swap}-${idx}`} style={{ flexDirection: 'row', gap: spacing.x3, alignItems: 'flex-start' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.mint, marginTop: 7 }} />
                  <Text style={{ color: palette.inkSoft, fontSize: type.body, flex: 1, lineHeight: 22 }}>{swap}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
