import { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import WellEarnedLogo from '@/components/WellEarnedLogo';
import { useAuth } from '@/context/AuthContext';
import { seedSampleData } from '@/services/sampleData';
import { palette, gradient, radius, spacing, type, shadow, button } from '@/theme/tokens';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: '🧘',
    title: 'AI-Powered Coaching',
    subtitle: 'Gemini analyzes your meals, workouts, and mood with multimodal AI',
    highlight: 'Snap a meal photo, record a workout video, or voice your feelings',
    color: palette.brand,
  },
  {
    id: '2',
    icon: '🌿',
    title: 'Earn Real Rewards',
    subtitle: 'Complete daily check-ins to earn SKR tokens on Solana blockchain',
    highlight: 'Streaks multiply your rewards — 30 days = 3x multiplier',
    color: palette.solana,
  },
  {
    id: '3',
    icon: '✨',
    title: 'Smart Insights',
    subtitle: 'Cross-feature AI analysis finds patterns in your wellness data',
    highlight: 'See how nutrition affects mood, track workout locations, and more',
    color: palette.lavender,
  },
];

type Props = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSeedAndStart = async () => {
    if (!user?.uid) { onComplete(); return; }
    setSeeding(true);
    try {
      await Promise.race([
        seedSampleData(user.uid),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
    } catch {}
    setSeeding(false);
    onComplete();
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={{ width, paddingHorizontal: spacing.x6, justifyContent: 'center', alignItems: 'center', gap: spacing.x6 }}>
      <View style={{
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: `${item.color}15`,
        alignItems: 'center', justifyContent: 'center',
        ...shadow.softGlow(item.color),
      }}>
        <Text style={{ fontSize: 44 }}>{item.icon}</Text>
      </View>

      <View style={{ alignItems: 'center', gap: spacing.x3 }}>
        <Text style={{ fontSize: type.title, fontWeight: '700', color: palette.ink, textAlign: 'center', letterSpacing: -0.3 }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: type.body, color: palette.inkSoft, textAlign: 'center', lineHeight: 24, maxWidth: 300 }}>
          {item.subtitle}
        </Text>
      </View>

      <View style={{
        backgroundColor: `${item.color}0A`,
        borderWidth: 0.5,
        borderColor: `${item.color}25`,
        borderRadius: radius.xl,
        padding: spacing.x5,
        width: '100%',
      }}>
        <Text style={{ color: item.color, fontSize: type.caption, fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>
          {item.highlight}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Soft ambient orbs */}
      <View style={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(123,175,142,0.06)' }} />
      <View style={{ position: 'absolute', bottom: 120, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(165,148,201,0.04)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', paddingTop: spacing.x8, paddingBottom: spacing.x4, gap: spacing.x3 }}>
          <View style={shadow.softGlow(palette.brand)}>
            <WellEarnedLogo size={56} />
          </View>
          <Text style={{ color: palette.ink, fontSize: type.subtitle, fontWeight: '700' }}>WellEarned</Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(idx);
          }}
        />

        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.x2, paddingVertical: spacing.x5 }}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={{
                  width: dotWidth, height: 8, borderRadius: 4,
                  backgroundColor: palette.brand,
                  opacity: dotOpacity,
                }}
              />
            );
          })}
        </View>

        {/* Bottom actions */}
        <View style={{ paddingHorizontal: spacing.x6, paddingBottom: spacing.x6, gap: spacing.x3 }}>
          <Pressable
            onPress={isLast ? handleSeedAndStart : handleNext}
            disabled={seeding}
            style={({ pressed }) => ({
              borderRadius: radius.lg, overflow: 'hidden',
              opacity: seeding ? 0.6 : pressed ? 0.85 : 1,
            })}
          >
            <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: button.lg, borderRadius: radius.lg }}>
              <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: type.body }}>
                {seeding ? 'Setting up your profile...' : isLast ? 'Get Started with Sample Data' : 'Next'}
              </Text>
            </LinearGradient>
          </Pressable>

          {isLast && (
            <Pressable
              onPress={onComplete}
              disabled={seeding}
              style={({ pressed }) => ({ paddingVertical: spacing.x3, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ textAlign: 'center', color: palette.inkMuted, fontSize: type.caption, fontWeight: '600' }}>
                Skip — start with empty data
              </Text>
            </Pressable>
          )}

          {!isLast && (
            <Pressable
              onPress={onComplete}
              style={({ pressed }) => ({ paddingVertical: spacing.x3, opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ textAlign: 'center', color: palette.inkMuted, fontSize: type.caption, fontWeight: '600' }}>
                Skip onboarding
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
