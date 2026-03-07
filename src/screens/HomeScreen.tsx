import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { Animated, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserCollection } from '@/hooks/useUserCollection';
import WellEarnedLogo from '@/components/WellEarnedLogo';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, card, button, row } from '@/theme/tokens';
import { Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CHAT_TOOL_DECLARATIONS, buildToolContext } from '@/utils/chatTools';
import { CHAT_SYSTEM_PROMPT, DAILY_TIP_PROMPT } from '@/utils/prompts';
import { PRO, FLASH } from '@/utils/models';
import { analyzeGemini, streamGeminiChat } from '@/services/gemini';
import { saveChatHistory, loadChatHistory } from '@/services/chatHistory';
import { useAuth } from '@/context/AuthContext';

type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

const suggestions = [
  'How is my nutrition this week?',
  'What workout should I do?',
  'How can I improve my mood?',
];

const StatBadge = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(28, 35, 32, 0.7)',
    borderRadius: radius.xl,
    padding: spacing.x4,
    alignItems: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(240,237,232,0.06)',
  }}>
    <Text style={{ fontSize: 26, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ color: palette.inkSoft, fontSize: type.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
  </View>
);

const CheckRow = ({ label, done, delay }: { label: string; done: boolean; delay: number }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim, delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: row.standard }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
        <View style={{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: done ? palette.mintGlow : 'rgba(240,237,232,0.04)',
          borderWidth: done ? 1 : 0.5,
          borderColor: done ? palette.mint : 'rgba(240,237,232,0.08)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {done && <Text style={{ color: palette.mint, fontSize: 13, fontWeight: '700' }}>&#10003;</Text>}
        </View>
        <Text style={{ color: done ? palette.ink : palette.inkSoft, fontSize: type.body, fontWeight: '500' }}>{label}</Text>
      </View>
      <View style={{
        backgroundColor: done ? palette.mintGlow : 'rgba(240,237,232,0.03)',
        paddingHorizontal: spacing.x3,
        paddingVertical: 4,
        borderRadius: radius.pill,
        borderWidth: 0.5,
        borderColor: done ? 'rgba(142,207,165,0.25)' : 'rgba(240,237,232,0.06)',
      }}>
        <Text style={{ color: done ? palette.mint : palette.inkMuted, fontSize: type.micro, fontWeight: '700', letterSpacing: 0.3 }}>
          {done ? 'DONE' : 'PENDING'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { items: meals } = useUserCollection('meals');
  const { items: workouts } = useUserCollection('workouts');
  const { items: moods } = useUserCollection('moods');
  const { user } = useAuth();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);

  // Load chat history from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    loadChatHistory(user.uid).then(setChatMessages).catch(() => {});
  }, [user?.uid]);

  // Generate daily tip on mount
  const tipGenerated = useRef(false);
  useEffect(() => {
    if (tipGenerated.current || meals.length + workouts.length + moods.length === 0) return;
    tipGenerated.current = true;
    setTipLoading(true);
    const context = JSON.stringify({
      recentMeals: meals.slice(0, 3),
      recentWorkouts: workouts.slice(0, 3),
      recentMoods: moods.slice(0, 3),
    });
    analyzeGemini(DAILY_TIP_PROMPT.replace('{context}', context), [], { model: FLASH })
      .then((res) => setDailyTip(typeof res === 'string' ? res : res?.text || JSON.stringify(res)))
      .catch(() => {})
      .finally(() => setTipLoading(false));
  }, [meals, workouts, moods]);

  const today = new Date().toISOString().slice(0, 10);
  const hasToday = (arr: any[]) => arr.some((x) => String(x.timestamp || '').slice(0, 10) === today);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const allDone = hasToday(meals) && hasToday(workouts) && hasToday(moods);

  const chatData = useMemo(
    () => [...chatMessages, ...(partial ? [{ id: 'partial', role: 'assistant' as const, content: partial }] : [])],
    [chatMessages, partial],
  );

  const sendChat = useCallback(async (text?: string) => {
    const value = (text ?? chatInput).trim();
    if (!value || streaming) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChatError(null);
    setChatInput('');
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', content: value };
    const next = [...chatMessages, userMsg];
    setChatMessages(next);
    setStreaming(true);
    setPartial('');
    try {
      const history = next.map((m) => ({ role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model', text: m.content }));
      const full = await streamGeminiChat(history, CHAT_SYSTEM_PROMPT, { model: PRO, tools: CHAT_TOOL_DECLARATIONS, toolContext: buildToolContext(meals, workouts, moods) }, setPartial);
      setChatMessages((prev) => {
        const updatedMessages = [...prev, { id: `${Date.now()}-a`, role: 'assistant' as const, content: full }];
        if (user?.uid) saveChatHistory(user.uid, updatedMessages).catch(() => {});
        return updatedMessages;
      });
      setPartial('');
    } catch (e: any) {
      setChatError(e?.message ?? 'Chat failed.');
    } finally {
      setStreaming(false);
    }
  }, [chatInput, chatMessages, streaming, meals, workouts, moods]);

  // Build a flat list of items: header sections + chat messages
  const listData = useMemo(() => {
    const items: { type: string; id: string; data?: any }[] = [
      { type: 'header', id: 'header' },
      { type: 'stats', id: 'stats' },
      { type: 'progress', id: 'progress' },
      { type: 'daily-tip', id: 'daily-tip' },
      { type: 'coach-header', id: 'coach-header' },
    ];

    if (chatData.length === 0) {
      items.push({ type: 'coach-empty', id: 'coach-empty' });
    } else {
      chatData.forEach((msg) => {
        items.push({ type: 'chat-msg', id: msg.id, data: msg });
      });
    }

    items.push({ type: 'coach-input', id: 'coach-input' });

    return items;
  }, [chatData, meals, workouts, moods, allDone]);

  const renderItem = useCallback(({ item }: { item: { type: string; id: string; data?: any } }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x4, marginBottom: spacing.x5 }}>
            <View style={shadow.softGlow(palette.brand)}>
              <WellEarnedLogo size={48} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.inkMuted, fontSize: type.micro, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>{greeting}</Text>
              <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }}>WellEarned</Text>
            </View>
          </View>
        );

      case 'stats':
        return (
          <View style={{ flexDirection: 'row', gap: spacing.x3, marginBottom: spacing.x5 }}>
            <StatBadge label="Meals" value={meals.length} color={palette.mint} />
            <StatBadge label="Workouts" value={workouts.length} color={palette.brand} />
            <StatBadge label="Moods" value={moods.length} color={palette.amber} />
          </View>
        );

      case 'progress':
        return (
          <View style={{ ...card, gap: spacing.x2, marginBottom: spacing.x5 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.x2 }}>
              <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Today</Text>
              {allDone && (
                <View style={{ backgroundColor: palette.mintGlow, paddingHorizontal: spacing.x3, paddingVertical: 4, borderRadius: radius.pill }}>
                  <Text style={{ color: palette.mint, fontSize: type.micro, fontWeight: '700' }}>ALL CLEAR</Text>
                </View>
              )}
            </View>
            <CheckRow label="Log a meal" done={hasToday(meals)} delay={0} />
            <CheckRow label="Complete a workout" done={hasToday(workouts)} delay={100} />
            <CheckRow label="Check in on mood" done={hasToday(moods)} delay={200} />
            {allDone && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); (navigation as any).navigate('Rewards'); }}
                style={({ pressed }) => ({ overflow: 'hidden', borderRadius: radius.lg, marginTop: spacing.x3, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
              >
                <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: spacing.x4, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: type.caption }}>Head to Rewards to claim your SKR!</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        );

      case 'daily-tip':
        return (
          <View style={{ ...card, marginBottom: spacing.x5, gap: spacing.x3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.lavender }} />
              <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Daily Tip</Text>
              <View style={{ backgroundColor: palette.lavenderSurface, paddingHorizontal: spacing.x3, paddingVertical: 3, borderRadius: radius.pill }}>
                <Text style={{ color: palette.lavender, fontSize: type.micro, fontWeight: '600' }}>AI</Text>
              </View>
            </View>
            {tipLoading ? (
              <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Generating your daily tip...</Text>
            ) : dailyTip ? (
              <Text style={{ color: palette.inkSoft, fontSize: type.body, lineHeight: 22 }}>{dailyTip}</Text>
            ) : (
              <Text style={{ color: palette.inkMuted, fontSize: type.body }}>Log meals, workouts, or moods to unlock daily tips</Text>
            )}
          </View>
        );

      case 'coach-header':
        return (
          <View style={{
            ...card,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomWidth: 0,
            paddingBottom: spacing.x3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.brand }} />
              <Text style={{ fontSize: type.subtitle, fontWeight: '700', color: palette.ink }}>Wellness Coach</Text>
              <View style={{ backgroundColor: palette.brandSurface, paddingHorizontal: spacing.x3, paddingVertical: 3, borderRadius: radius.pill }}>
                <Text style={{ color: palette.brandLight, fontSize: type.micro, fontWeight: '600' }}>LIVE</Text>
              </View>
            </View>
          </View>
        );

      case 'coach-empty':
        return (
          <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: 'rgba(240,237,232,0.08)', paddingHorizontal: spacing.x5, paddingVertical: spacing.x3, gap: spacing.x4 }}>
            <Text style={{ color: palette.inkSoft, fontSize: type.body }}>Ask about meals, workouts, mood, or your streak.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 }}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => sendChat(s)}
                  style={({ pressed }) => ({
                    backgroundColor: palette.brandSurface,
                    borderWidth: 0.5,
                    borderColor: 'rgba(123,175,142,0.2)',
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.x4,
                    paddingVertical: spacing.x2,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ color: palette.brandLight, fontSize: type.caption }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'chat-msg': {
        const msg = item.data as ChatMessage;
        return (
          <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.7)', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: 'rgba(240,237,232,0.08)', paddingHorizontal: spacing.x5, paddingVertical: spacing.x1 }}>
            <View style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              {msg.role === 'user' ? (
                <View style={{ borderRadius: radius.xl, borderBottomRightRadius: radius.xs, overflow: 'hidden' }}>
                  <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: spacing.x4, paddingVertical: spacing.x3 }}>
                    <Text style={{ color: '#fff', fontSize: type.body, lineHeight: 21 }}>{msg.content}</Text>
                  </LinearGradient>
                </View>
              ) : (
                <View style={{
                  backgroundColor: 'rgba(240,237,232,0.05)',
                  borderWidth: 0.5,
                  borderColor: 'rgba(240,237,232,0.08)',
                  borderRadius: radius.xl,
                  borderBottomLeftRadius: radius.xs,
                  paddingHorizontal: spacing.x4,
                  paddingVertical: spacing.x3,
                }}>
                  <Text style={{ color: palette.ink, fontSize: type.body, lineHeight: 21 }}>{msg.content}</Text>
                </View>
              )}
            </View>
          </View>
        );
      }

      case 'coach-input':
        return (
          <View style={{
            ...card,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderTopWidth: 0,
            paddingTop: spacing.x3,
            marginBottom: spacing.x5,
          }}>
            {chatError ? (
              <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3, marginBottom: spacing.x2 }}>
                <Text style={{ color: palette.danger, fontSize: type.caption }}>{chatError}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', gap: spacing.x2 }}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask your wellness coach..."
                placeholderTextColor={palette.inkMuted}
                style={{
                  flex: 1,
                  borderColor: 'rgba(240,237,232,0.08)',
                  borderWidth: 0.5,
                  borderRadius: radius.xl,
                  paddingHorizontal: spacing.x5,
                  paddingVertical: button.md,
                  fontSize: 16,
                  color: palette.ink,
                  backgroundColor: 'rgba(240,237,232,0.03)',
                }}
                editable={!streaming}
              />
              <Pressable
                onPress={() => sendChat()}
                disabled={streaming}
                style={({ pressed }) => ({
                  borderRadius: radius.xl,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  opacity: streaming ? 0.4 : pressed ? 0.7 : 1,
                })}
              >
                <LinearGradient colors={gradient.brand} style={{ paddingHorizontal: spacing.x5, paddingVertical: button.md }}>
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: type.body }}>{streaming ? '...' : 'Send'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  }, [greeting, meals, workouts, moods, allDone, chatInput, streaming, chatError, sendChat, dailyTip, tipLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Soft ambient orbs */}
      <View style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(123,175,142,0.05)' }} />
      <View style={{ position: 'absolute', top: 350, left: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(165,148,201,0.04)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.x5, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}
