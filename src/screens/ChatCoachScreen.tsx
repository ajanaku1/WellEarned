import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserCollection } from '@/hooks/useUserCollection';
import { CHAT_TOOL_DECLARATIONS, buildToolContext } from '@/utils/chatTools';
import { CHAT_SYSTEM_PROMPT } from '@/utils/prompts';
import { PRO } from '@/utils/models';
import { streamGeminiChat } from '@/services/gemini';
import { saveChatHistory, loadChatHistory } from '@/services/chatHistory';
import { useAuth } from '@/context/AuthContext';
import { palette, gradient, radius, spacing, type, button } from '@/theme/tokens';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const suggestions = [
  'How is my nutrition this week?',
  'What workout should I do?',
  'How can I improve my mood?',
];

export default function ChatCoachScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const { items: meals } = useUserCollection('meals');
  const { items: workouts } = useUserCollection('workouts');
  const { items: moods } = useUserCollection('moods');

  useEffect(() => {
    if (!user?.uid) return;
    loadChatHistory(user.uid).then(setMessages).catch(() => {});
  }, [user?.uid]);

  const data = useMemo(
    () => [...messages, ...(partial ? [{ id: 'partial', role: 'assistant' as const, content: partial }] : [])],
    [messages, partial],
  );

  const send = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || streaming) return;
    setError(null);
    setInput('');
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', content: value };
    const next = [...messages, userMessage];
    setMessages(next);
    setStreaming(true);
    setPartial('');
    try {
      const history = next.map((m) => ({ role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model', text: m.content }));
      const full = await streamGeminiChat(history, CHAT_SYSTEM_PROMPT, { model: PRO, tools: CHAT_TOOL_DECLARATIONS, toolContext: buildToolContext(meals, workouts, moods) }, setPartial);
      setMessages((prev) => {
        const updatedMessages = [...prev, { id: `${Date.now()}-a`, role: 'assistant' as const, content: full }];
        if (user?.uid) saveChatHistory(user.uid, updatedMessages).catch(() => {});
        return updatedMessages;
      });
      setPartial('');
    } catch (e: any) {
      setError(e?.message ?? 'Chat failed.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <View style={{ flex: 1, gap: spacing.x3 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        nestedScrollEnabled
        contentContainerStyle={{ gap: spacing.x3, paddingBottom: spacing.x2 }}
        renderItem={({ item }) => (
          <View style={{ alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {item.role === 'user' ? (
              <View style={{ borderRadius: radius.xl, borderBottomRightRadius: radius.xs, overflow: 'hidden' }}>
                <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingHorizontal: spacing.x4, paddingVertical: spacing.x3 }}>
                  <Text style={{ color: '#fff', fontSize: type.body, lineHeight: 21 }}>{item.content}</Text>
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
                <Text style={{ color: palette.ink, fontSize: type.body, lineHeight: 21 }}>{item.content}</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={{ gap: spacing.x4 }}>
            <Text style={{ color: palette.inkSoft, fontSize: type.body }}>Ask about meals, workouts, mood, or your streak.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.x2 }}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => send(s)}
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
        }
      />

      {error ? (
        <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}>
          <Text style={{ color: palette.danger, fontSize: type.caption }}>{error}</Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.x2 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
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
          onPress={() => send()}
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
}
