import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const MealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const analyzeProgress = interpolate(frame, [90, 180], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showResults = frame > 180;
  const resultsEnter = spring({ frame: frame - 180, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });

  return (
    <AbsoluteFill>
      <GradientBackground variant="warm" />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        <DeviceFrame enterDelay={5} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%' }}>
            {/* Tab header */}
            <FadeSlide delay={10}>
              <div style={{ color: C.ink, fontSize: 17, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 4, letterSpacing: -0.3 }}>Capture</div>
              <div style={{ color: C.inkSoft, fontSize: 11, fontFamily: 'system-ui', marginBottom: 12 }}>Log with AI-powered analysis</div>
            </FadeSlide>

            {/* Tabs */}
            <FadeSlide delay={15}>
              <div style={{ display: 'flex', background: 'rgba(240,237,232,0.04)', borderRadius: 99, padding: 2, marginBottom: 14 }}>
                {['Meal', 'Workout', 'Mood'].map((t, i) => (
                  <div
                    key={t}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '7px 0',
                      borderRadius: 99,
                      background: i === 0 ? C.brand : 'transparent',
                      color: i === 0 ? '#fff' : C.inkMuted,
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'system-ui',
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </FadeSlide>

            {/* Photo placeholder */}
            <FadeSlide delay={20}>
              <div
                style={{
                  height: 140,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${C.card}, rgba(212,167,106,0.08))`,
                  border: '0.5px solid rgba(240,237,232,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  fontSize: 40,
                  overflow: 'hidden',
                }}
              >
                🥗
              </div>
            </FadeSlide>

            {/* Analyze button with progress */}
            <FadeSlide delay={30}>
              <div
                style={{
                  background: `linear-gradient(90deg, ${C.brand}, ${C.brandDeep})`,
                  borderRadius: 14,
                  padding: '10px 0',
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'system-ui',
                  marginBottom: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {analyzeProgress > 0 && analyzeProgress < 1 && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${analyzeProgress * 100}%`, background: C.mint, borderRadius: 2 }} />
                )}
                {frame < 90 ? 'Analyze Meal' : frame < 180 ? 'Analyzing with AI...' : 'Analysis Complete'}
              </div>
            </FadeSlide>

            {/* Results */}
            {showResults && (
              <div style={{ opacity: resultsEnter, transform: `translateY(${interpolate(resultsEnter, [0, 1], [20, 0])}px)` }}>
                <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 16, padding: 12, border: '0.5px solid rgba(240,237,232,0.06)', marginBottom: 8 }}>
                  <div style={{ color: C.ink, fontWeight: 700, fontSize: 13, fontFamily: 'system-ui', marginBottom: 6 }}>Mediterranean Salad Bowl</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: `${C.mint}20`, color: C.mint, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: 'system-ui' }}>8/10</span>
                    <span style={{ color: C.inkSoft, fontSize: 10, fontFamily: 'system-ui' }}>health score</span>
                  </div>
                </div>

                {/* Nutrition grid */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { label: 'Cal', value: '420', color: C.brand },
                    { label: 'Protein', value: '28g', color: C.mint },
                    { label: 'Carbs', value: '45g', color: C.amber },
                    { label: 'Fat', value: '18g', color: C.danger },
                  ].map((n) => (
                    <div
                      key={n.label}
                      style={{
                        flex: 1,
                        background: 'rgba(28,35,32,0.7)',
                        borderRadius: 10,
                        padding: '8px 4px',
                        textAlign: 'center',
                        border: '0.5px solid rgba(240,237,232,0.06)',
                      }}
                    >
                      <div style={{ color: n.color, fontWeight: 700, fontSize: 13, fontFamily: 'system-ui' }}>{n.value}</div>
                      <div style={{ color: C.inkMuted, fontSize: 8, fontWeight: 600, fontFamily: 'system-ui' }}>{n.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DeviceFrame>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420 }}>
          <FadeSlide delay={15} direction="left">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              AI Meal<br /><span style={{ color: C.mint }}>Analysis</span>
            </h2>
          </FadeSlide>
          <FadeSlide delay={25} direction="left">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              Snap a photo. The AI identifies ingredients, estimates macros, and scores nutrition — instantly.
            </p>
          </FadeSlide>
          <FadeSlide delay={40} direction="left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Ingredient detection', 'Macro estimation', 'Health scoring', 'SHA-256 hashed on Solana'].map((f, i) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: i === 3 ? C.solana : C.mint }} />
                  <span style={{ color: i === 3 ? C.solana : C.inkSoft, fontSize: 16, fontFamily: 'system-ui', fontWeight: i === 3 ? 600 : 400 }}>{f}</span>
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>
      </AbsoluteFill>

      <Caption text={VOICEOVER.mealAnalysis} />
    </AbsoluteFill>
  );
};
