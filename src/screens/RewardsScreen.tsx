import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Animated, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useUserCollection } from '@/hooks/useUserCollection';
import { getTodayClaim, getCollectionForToday, recordClaim } from '@/services/firestore';
import {
  buildRewardClaimTx,
  distributeReward,
  getTransactionExplorerUrl,
  getRecentClaims,
  ensureUserInitialized,
  fetchUserRewardAccount,
  RecentClaim,
} from '@/services/solanaProgram';
import { signAndSendTransaction, getSolBalance, requestDevnetAirdrop } from '@/services/wallet';
import * as Haptics from 'expo-haptics';
import { palette, gradient, radius, spacing, type, shadow, card, glowCard, button, row } from '@/theme/tokens';

const baseReward = 10;
const dayKey = () => new Date().toISOString().slice(0, 10);

/** Check if multiplier is active: need 3+ days with all 3 activities in the past 7 days */
function checkMultiplierEligible(meals: any[], workouts: any[], moods: any[]): { eligible: boolean; activeDays: number } {
  let activeDays = 0;
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hasMeal = meals.some((x) => String(x.timestamp || '').slice(0, 10) === key);
    const hasWorkout = workouts.some((x) => String(x.timestamp || '').slice(0, 10) === key);
    const hasMood = moods.some((x) => String(x.timestamp || '').slice(0, 10) === key);
    if (hasMeal && hasWorkout && hasMood) activeDays++;
  }
  return { eligible: activeDays >= 3, activeDays };
}

function rewardAmount(streak: number, multiplierActive: boolean) {
  if (!multiplierActive) return baseReward;
  if (streak >= 30) return baseReward * 3;
  if (streak >= 14) return baseReward * 2;
  if (streak >= 7) return Math.round(baseReward * 1.5);
  return baseReward;
}

function buildStreakDays(checkins: string[]) {
  return new Array(42).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (41 - i));
    const key = d.toISOString().slice(0, 10);
    return { day: key, checked: checkins.includes(key) };
  });
}

const truncateSig = (sig: string) => `${sig.slice(0, 8)}...${sig.slice(-6)}`;

export default function RewardsScreen() {
  const { user } = useAuth();
  const { walletAddress } = useWallet();
  const { items: meals } = useUserCollection('meals');
  const { items: workouts } = useUserCollection('workouts');
  const { items: moods } = useUserCollection('moods');
  const [claiming, setClaiming] = useState(false);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [onChainStats, setOnChainStats] = useState<{ totalMeals: number; totalWorkouts: number; totalMoods: number; totalEarned: number } | null>(null);

  const claimPulse = useRef(new Animated.Value(1)).current;

  const checkedByDay = useMemo(() => {
    const keySet = new Set<string>();
    const mark = (arr: any[]) => arr.forEach((x) => keySet.add(String(x.timestamp || '').slice(0, 10)));
    mark(meals); mark(workouts); mark(moods);
    return [...keySet];
  }, [meals, workouts, moods]);

  const streak = useMemo(() => {
    let n = 0;
    const now = new Date();
    while (n < 365) {
      const d = new Date(now);
      d.setDate(now.getDate() - n);
      const key = d.toISOString().slice(0, 10);
      if (!meals.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      if (!workouts.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      if (!moods.some((x) => String(x.timestamp || '').slice(0, 10) === key)) break;
      n += 1;
    }
    return n;
  }, [meals, workouts, moods]);

  const today = dayKey();
  const todayMeal = meals.some((x) => String(x.timestamp || '').slice(0, 10) === today);
  const todayWorkout = workouts.some((x) => String(x.timestamp || '').slice(0, 10) === today);
  const todayMood = moods.some((x) => String(x.timestamp || '').slice(0, 10) === today);
  const todayActivityCount = [todayMeal, todayWorkout, todayMood].filter(Boolean).length;
  const eligible = todayActivityCount >= 2;
  const milestone = streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : streak + 10;

  // Multiplier: need 3+ days with all 3 activities in past 7 days
  const { eligible: multiplierActive, activeDays: weeklyActiveDays } = useMemo(
    () => checkMultiplierEligible(meals, workouts, moods),
    [meals, workouts, moods],
  );
  const reward = rewardAmount(streak, multiplierActive);
  const multiplier = !multiplierActive ? '1x' : streak >= 30 ? '3x' : streak >= 14 ? '2x' : streak >= 7 ? '1.5x' : '1x';

  const fetchRecentClaims = useCallback(async () => {
    if (!walletAddress) return;
    setLoadingClaims(true);
    try {
      const claims = await getRecentClaims(walletAddress);
      setRecentClaims(claims);
    } catch {
    } finally {
      setLoadingClaims(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchRecentClaims();
  }, [fetchRecentClaims]);

  // Fetch on-chain stats
  useEffect(() => {
    if (!walletAddress) return;
    fetchUserRewardAccount(walletAddress).then((acc) => {
      if (acc) setOnChainStats({ totalMeals: acc.totalMeals, totalWorkouts: acc.totalWorkouts, totalMoods: acc.totalMoods, totalEarned: acc.totalEarned });
    }).catch(() => {});
  }, [walletAddress]);

  useEffect(() => {
    if (!eligible) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(claimPulse, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(claimPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [eligible, claimPulse]);

  const claimDailyReward = async () => {
    if (!user?.uid || !walletAddress || !eligible) {
      if (!walletAddress) Alert.alert('Wallet required', 'Connect a Solana wallet in Profile first.');
      return;
    }
    setClaiming(true);
    try {
      const claimed = await getTodayClaim(user.uid, today);
      if (claimed?.signature) {
        Alert.alert('Already claimed', 'You already claimed today.');
        return;
      }

      const [mealToday, workoutToday, moodToday] = await Promise.all([
        getCollectionForToday(user.uid, 'meals', today),
        getCollectionForToday(user.uid, 'workouts', today),
        getCollectionForToday(user.uid, 'moods', today),
      ]);
      const activityCount = [mealToday.length > 0, workoutToday.length > 0, moodToday.length > 0].filter(Boolean).length;
      if (activityCount < 2) {
        Alert.alert('Not eligible', 'Log at least 2 activities today (meal, workout, or mood).');
        return;
      }

      // Ensure user has SOL for tx fees
      const bal = await getSolBalance(walletAddress);
      if (bal < 0.005) {
        await requestDevnetAirdrop(walletAddress, 0.1);
      }

      // Initialize on-chain user account if needed
      await ensureUserInitialized(walletAddress, signAndSendTransaction);

      const tx = await buildRewardClaimTx(walletAddress, streak, reward);
      const signature = await signAndSendTransaction(tx);
      const explorerUrl = getTransactionExplorerUrl(signature);

      const tokenSig = await distributeReward(walletAddress, reward);

      await recordClaim(user.uid, today, {
        signature,
        tokenSignature: tokenSig,
        amount: reward,
        streak,
        status: 'confirmed',
        explorerUrl,
      });

      await fetchRecentClaims();

      Alert.alert(
        'Reward Claimed!',
        `${reward} SKR claimed on-chain.\n\nTx: ${truncateSig(signature)}`,
        [
          { text: 'View on Explorer', onPress: () => Linking.openURL(explorerUrl) },
          { text: 'OK', style: 'cancel' },
        ],
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Claim failed', e?.message ?? 'Unable to claim reward.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ position: 'absolute', top: 0, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(142,207,165,0.05)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.x5, gap: spacing.x5, paddingBottom: 100 }}>
          <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, letterSpacing: -0.3 }}>Rewards</Text>

          {/* Streak Hero — glass card with soft glow */}
          <View style={{ borderRadius: radius.xl, overflow: 'hidden', ...shadow.softGlow(palette.brand) }}>
            <View style={{ backgroundColor: 'rgba(28, 35, 32, 0.75)', padding: spacing.x6, borderRadius: radius.xl, borderWidth: 0.5, borderColor: palette.borderBrand }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ gap: 6 }}>
                  <Text style={{ color: palette.inkSoft, fontSize: type.micro, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 }}>Current Streak</Text>
                  <Text style={{ fontSize: 44, fontWeight: '700', color: palette.ink }}>{streak}</Text>
                  <Text style={{ color: palette.inkSoft, fontSize: type.body }}>consecutive days</Text>
                </View>
                <View style={{ alignItems: 'center', gap: spacing.x3 }}>
                  <View style={{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.brandSurface, borderWidth: 1, borderColor: palette.borderBrand }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: palette.brand }}>{multiplier}</Text>
                  </View>
                  <Text style={{ color: palette.mint, fontSize: type.caption, fontWeight: '600' }}>{reward} SKR</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Today's Checkins */}
          <View style={{ ...card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.x3 }}>
              <Text style={{ fontWeight: '700', color: palette.ink, fontSize: type.subtitle }}>Today</Text>
              <Text style={{ color: eligible ? palette.brand : palette.inkMuted, fontSize: type.caption, fontWeight: '600' }}>
                {todayActivityCount}/2 required
              </Text>
            </View>
            {[
              { label: 'Meal logged', done: todayMeal, color: palette.mint },
              { label: 'Workout done', done: todayWorkout, color: palette.brand },
              { label: 'Mood checked', done: todayMood, color: palette.amber },
            ].map(({ label, done, color }) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: row.standard }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: done ? `${color}20` : 'rgba(240,237,232,0.04)',
                    borderWidth: done ? 0 : 0.5,
                    borderColor: 'rgba(240,237,232,0.08)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done && <Text style={{ color, fontSize: 12, fontWeight: '700' }}>&#10003;</Text>}
                  </View>
                  <Text style={{ color: done ? palette.ink : palette.inkMuted, fontSize: type.body }}>{label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Claim Button */}
          <Animated.View style={{ transform: [{ scale: eligible ? claimPulse : 1 }] }}>
            <Pressable
              onPress={claimDailyReward}
              disabled={!eligible || claiming}
              style={({ pressed }) => ({
                borderRadius: radius.xl,
                overflow: 'hidden',
                opacity: !eligible ? 0.4 : claiming ? 0.7 : pressed ? 0.85 : 1,
              })}
            >
              <LinearGradient
                colors={eligible ? (gradient.mint) : [palette.surfaceMuted, palette.surfaceMuted]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: button.lg, borderRadius: radius.xl, alignItems: 'center' }}
              >
                <Text style={{ color: eligible ? '#0F1210' : palette.inkMuted, fontWeight: '700', fontSize: type.subtitle }}>
                  {claiming ? 'Verifying on-chain...' : eligible ? `Claim ${reward} SKR` : `Log ${2 - todayActivityCount} more activit${2 - todayActivityCount === 1 ? 'y' : 'ies'}`}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Streak Grid */}
          <View style={{ ...card }}>
            <Text style={{ fontWeight: '700', marginBottom: spacing.x4, color: palette.ink, fontSize: type.subtitle }}>Streak History</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {buildStreakDays(checkedByDay).map((cell) => (
                <View key={cell.day} style={{
                  width: '12.5%',
                  aspectRatio: 1,
                  borderRadius: radius.xs,
                  backgroundColor: cell.checked ? palette.brand : 'rgba(240,237,232,0.03)',
                  borderWidth: 0.5,
                  borderColor: cell.checked ? 'rgba(123,175,142,0.3)' : 'rgba(240,237,232,0.04)',
                }} />
              ))}
            </View>
          </View>

          {/* Multiplier Status */}
          <View style={{ ...card, gap: spacing.x3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: multiplierActive ? palette.brandSurface : 'rgba(240,237,232,0.04)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 0.5, borderColor: multiplierActive ? palette.borderBrand : 'rgba(240,237,232,0.08)',
              }}>
                <Text style={{ fontSize: 18, color: multiplierActive ? palette.brand : palette.inkMuted }}>&#215;</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: multiplierActive ? palette.brand : palette.inkMuted, fontSize: type.body }}>
                  {multiplierActive ? `Multiplier Active (${multiplier})` : 'Multiplier Locked'}
                </Text>
                <Text style={{ color: palette.inkSoft, marginTop: 2, fontSize: type.caption }}>
                  {multiplierActive
                    ? `${weeklyActiveDays}/7 active days this week — streak bonus applied!`
                    : `${weeklyActiveDays}/3 active days this week — need ${3 - weeklyActiveDays} more to unlock`}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: spacing.x2 }}>
              {[...Array(7)].map((_, i) => (
                <View key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  backgroundColor: i < weeklyActiveDays
                    ? (weeklyActiveDays >= 3 ? palette.brand : palette.amber)
                    : 'rgba(240,237,232,0.06)',
                }} />
              ))}
            </View>
            <Text style={{ color: palette.inkMuted, fontSize: type.micro }}>
              Log all 3 activities (meal + workout + mood) on 3+ days per week to activate multipliers
            </Text>
          </View>

          {/* Milestone */}
          <View style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: spacing.x4 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.amberSurface, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18, color: palette.amber }}>&#9733;</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: palette.amber, fontSize: type.body }}>Next Milestone</Text>
              <Text style={{ color: palette.inkSoft, marginTop: 2, fontSize: type.caption }}>
                {multiplierActive
                  ? `${Math.max(milestone - streak, 0)} more days to unlock the next multiplier tier`
                  : 'Activate multiplier first by logging 3 days of full activities'}
              </Text>
            </View>
          </View>

          {/* On-Chain Activity Stats */}
          {walletAddress && onChainStats && (
            <View style={{ ...card, gap: spacing.x3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.x3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.solana }} />
                <Text style={{ fontWeight: '700', color: palette.ink, fontSize: type.subtitle }}>On-Chain Activity</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.x3 }}>
                {[
                  { label: 'Meals', value: onChainStats.totalMeals, color: palette.mint },
                  { label: 'Workouts', value: onChainStats.totalWorkouts, color: palette.brand },
                  { label: 'Moods', value: onChainStats.totalMoods, color: palette.amber },
                ].map((s) => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(28,35,32,0.7)', borderRadius: radius.lg, padding: spacing.x3, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: 'rgba(240,237,232,0.06)' }}>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: s.color }}>{s.value}</Text>
                    <Text style={{ color: palette.inkMuted, fontSize: type.micro, fontWeight: '600' }}>{s.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ color: palette.inkMuted, fontSize: type.micro, textAlign: 'center' }}>
                Verified on Solana devnet
              </Text>
            </View>
          )}

          {/* Recent On-Chain Claims */}
          {walletAddress && (
            <View style={{ ...card, gap: spacing.x3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: palette.ink, fontSize: type.subtitle }}>On-Chain Claims</Text>
                <Pressable onPress={fetchRecentClaims} disabled={loadingClaims}>
                  <Text style={{ color: palette.cyan, fontSize: type.caption, fontWeight: '600' }}>
                    {loadingClaims ? 'Loading...' : 'Refresh'}
                  </Text>
                </Pressable>
              </View>

              {recentClaims.length === 0 ? (
                <Text style={{ color: palette.inkMuted, fontSize: type.caption }}>
                  {loadingClaims ? 'Fetching transactions...' : 'No on-chain claims yet. Claim your first reward above!'}
                </Text>
              ) : (
                recentClaims.map((claim) => (
                  <Pressable
                    key={claim.signature}
                    onPress={() => Linking.openURL(claim.explorerUrl)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: pressed ? 'rgba(240,237,232,0.04)' : 'rgba(240,237,232,0.02)',
                      borderRadius: radius.sm,
                      padding: spacing.x3,
                      borderWidth: 0.5,
                      borderColor: 'rgba(240,237,232,0.04)',
                    })}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ color: palette.solana, fontSize: type.caption, fontWeight: '600' }}>
                        {truncateSig(claim.signature)}
                      </Text>
                      {claim.timestamp && (
                        <Text style={{ color: palette.inkMuted, fontSize: type.micro }}>
                          {new Date(claim.timestamp).toLocaleDateString()} {new Date(claim.timestamp).toLocaleTimeString()}
                        </Text>
                      )}
                    </View>
                    <Text style={{ color: palette.cyan, fontSize: type.micro, fontWeight: '600' }}>
                      Explorer &rarr;
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
