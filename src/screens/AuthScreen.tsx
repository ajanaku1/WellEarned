import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import WellEarnedLogo from '@/components/WellEarnedLogo';
import { useAuth } from '@/context/AuthContext';
import { env } from '@/config/env';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, button } from '@/theme/tokens';

type Mode = 'signin' | 'signup';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthButtonProps = {
  disabled: boolean;
  onSuccess: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
};

function GoogleAuthButton({ disabled, onSuccess, onError }: GoogleAuthButtonProps) {
  const [busy, setBusy] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: env.googleWebClientId || undefined,
    androidClientId: env.googleAndroidClientId || undefined,
    iosClientId: env.googleIosClientId || undefined,
    responseType: 'id_token',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    const run = async () => {
      if (response?.type !== 'success') return;
      const idToken = response.params?.id_token;
      if (!idToken) { onError('Google sign-in did not return an ID token.'); setBusy(false); return; }
      await onSuccess(idToken);
      setBusy(false);
    };
    run().catch(() => { onError('Google sign-in failed.'); setBusy(false); });
  }, [onError, onSuccess, response]);

  return (
    <Pressable
      onPress={async () => { setBusy(true); try { await promptAsync(); } catch { setBusy(false); onError('Google sign-in could not start.'); } }}
      disabled={!request || disabled || busy}
      style={({ pressed }) => ({
        backgroundColor: 'rgba(240,237,232,0.05)',
        borderColor: 'rgba(240,237,232,0.1)',
        borderWidth: 0.5,
        borderRadius: radius.lg,
        paddingVertical: button.md,
        opacity: !request || disabled || busy ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ textAlign: 'center', color: palette.ink, fontWeight: '600', fontSize: type.body }}>
        {busy ? 'Connecting...' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
}

export default function AuthScreen() {
  const { signIn, signUp, signInAsGuest, signInWithWallet, signInWithGoogleIdToken, authError, authBusy } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const hasGoogleConfig = Boolean(env.googleWebClientId || env.googleAndroidClientId || env.googleIosClientId);

  // Gentle breathing animation for logo
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const actionLabel = useMemo(() => {
    if (authBusy) return mode === 'signin' ? 'Signing in...' : 'Creating account...';
    return mode === 'signin' ? 'Sign In' : 'Create Account';
  }, [mode, authBusy]);

  const onSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalError(null);
    const e = email.trim();
    if (!e || !password.trim()) { setLocalError('Email and password are required.'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    if (mode === 'signin') await signIn(e, password);
    else await signUp(e, password);
  };

  const onWalletLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalError(null);
    setWalletConnecting(true);
    try {
      const { connectWalletMobile, setConnectedWallet } = require('@/services/wallet');
      const address = await connectWalletMobile();
      setConnectedWallet(address);
      await signInWithWallet(address);
    } catch (e: any) {
      if (e?.message?.includes('Mobile Wallet Adapter')) {
        setLocalError('No wallet app found. Install Phantom or Solflare, or use Guest mode.');
      } else {
        setLocalError(e?.message ?? 'Wallet connection failed.');
      }
    } finally {
      setWalletConnecting(false);
    }
  };

  const inputStyle = {
    borderWidth: 0.5,
    borderColor: 'rgba(240,237,232,0.08)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.x5,
    paddingVertical: button.md,
    fontSize: 16,
    color: palette.ink,
    backgroundColor: 'rgba(240,237,232,0.03)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Soft ambient orbs */}
      <View style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(123,175,142,0.06)' }} />
      <View style={{ position: 'absolute', top: 240, right: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(165,148,201,0.04)' }} />
      <View style={{ position: 'absolute', bottom: -40, left: 60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(212,167,106,0.04)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: spacing.x6, justifyContent: 'center', gap: spacing.x8 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={{ alignItems: 'center', gap: spacing.x5 }}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }], ...shadow.softGlow(palette.brand) }}>
              <WellEarnedLogo size={90} />
            </Animated.View>
            <Text style={{ color: palette.ink, fontSize: type.hero, fontWeight: '700', letterSpacing: -0.5 }}>
              WellEarned
            </Text>
            <Text style={{ color: palette.inkSoft, fontSize: type.body, textAlign: 'center', lineHeight: 24, maxWidth: 300 }}>
              Build healthy habits. Earn rewards.{'\n'}Your AI wellness companion.
            </Text>
          </View>

          {/* Auth Card — glass material */}
          <View style={{
            backgroundColor: 'rgba(28, 35, 32, 0.7)',
            borderRadius: radius.xl,
            borderWidth: 0.5,
            borderColor: 'rgba(240,237,232,0.08)',
            padding: spacing.x6,
            gap: spacing.x4,
            ...shadow.md,
          }}>
            {/* Segmented Control */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(240,237,232,0.04)', borderRadius: radius.pill, padding: 3 }}>
              {(['signin', 'signup'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={{ flex: 1, borderRadius: radius.pill, paddingVertical: button.sm, overflow: 'hidden' }}
                >
                  {mode === m ? (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.pill, backgroundColor: palette.brand }} />
                  ) : null}
                  <Text style={{ textAlign: 'center', color: mode === m ? '#fff' : palette.inkMuted, fontWeight: '600', fontSize: type.caption }}>
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={palette.inkMuted} autoCapitalize="none" keyboardType="email-address" style={inputStyle} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={palette.inkMuted} secureTextEntry style={inputStyle} />

            {localError ? (
              <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}>
                <Text style={{ color: palette.danger, fontSize: type.caption }}>{localError}</Text>
              </View>
            ) : null}
            {authError ? (
              <View style={{ backgroundColor: palette.dangerGlow, borderRadius: radius.sm, padding: spacing.x3 }}>
                <Text style={{ color: palette.danger, fontSize: type.caption }}>{authError}</Text>
              </View>
            ) : null}

            {/* Primary CTA */}
            <Pressable
              onPress={onSubmit}
              disabled={authBusy}
              style={({ pressed }) => ({
                borderRadius: radius.lg,
                overflow: 'hidden',
                opacity: authBusy ? 0.6 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.lg, borderRadius: radius.lg }}>
                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: type.body }}>
                  {actionLabel}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x4 }}>
              <View style={{ flex: 1, height: 0.5, backgroundColor: 'rgba(240,237,232,0.08)' }} />
              <Text style={{ color: palette.inkMuted, fontSize: type.caption }}>or</Text>
              <View style={{ flex: 1, height: 0.5, backgroundColor: 'rgba(240,237,232,0.08)' }} />
            </View>

            {/* Connect Wallet */}
            <Pressable
              onPress={onWalletLogin}
              disabled={authBusy || walletConnecting}
              style={({ pressed }) => ({
                borderRadius: radius.lg,
                overflow: 'hidden',
                opacity: authBusy || walletConnecting ? 0.4 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <LinearGradient colors={gradient.mint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
                <Text style={{ textAlign: 'center', color: '#0F1210', fontWeight: '700', fontSize: type.body }}>
                  {walletConnecting ? 'Connecting Wallet...' : 'Connect Wallet'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Google */}
            {hasGoogleConfig ? (
              <GoogleAuthButton disabled={authBusy} onError={(m) => setLocalError(m)} onSuccess={signInWithGoogleIdToken} />
            ) : (
              <Pressable
                onPress={() => setLocalError('Google Sign-In not configured. Add EXPO_PUBLIC_GOOGLE_* keys.')}
                style={({ pressed }) => ({
                  backgroundColor: 'rgba(240,237,232,0.05)',
                  borderColor: 'rgba(240,237,232,0.08)',
                  borderWidth: 0.5,
                  borderRadius: radius.lg,
                  paddingVertical: button.md,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ textAlign: 'center', color: palette.ink, fontWeight: '600', fontSize: type.body }}>Continue with Google</Text>
              </Pressable>
            )}
          </View>

          {/* Guest Demo Mode — prominent CTA */}
          <View style={{
            backgroundColor: 'rgba(123,175,142,0.08)',
            borderRadius: radius.xl,
            borderWidth: 0.5,
            borderColor: 'rgba(123,175,142,0.2)',
            padding: spacing.x5,
            gap: spacing.x3,
            alignItems: 'center',
          }}>
            <Text style={{ color: palette.ink, fontSize: type.body, fontWeight: '700', textAlign: 'center' }}>
              Want to try it out first?
            </Text>
            <Text style={{ color: palette.inkSoft, fontSize: type.caption, textAlign: 'center', lineHeight: 20 }}>
              Sign in as a guest to explore all features — AI meal analysis, workout coaching, mood tracking, and on-chain rewards.
            </Text>
            <Pressable
              onPress={() => { setLocalError(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); signInAsGuest(); }}
              disabled={authBusy}
              style={({ pressed }) => ({
                borderRadius: radius.lg,
                overflow: 'hidden',
                width: '100%',
                opacity: authBusy ? 0.4 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                marginTop: spacing.x2,
              })}
            >
              <LinearGradient colors={gradient.mint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.md, borderRadius: radius.lg }}>
                <Text style={{ textAlign: 'center', color: '#0F1210', fontWeight: '700', fontSize: type.body }}>
                  {authBusy ? 'Starting demo...' : 'Try Demo as Guest'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
