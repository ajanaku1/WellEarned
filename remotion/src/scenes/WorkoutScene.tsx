import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const WorkoutScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showResult = frame > 150;
  const resultEnter = spring({ frame: frame - 150, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });
  const recPulse = Math.sin(frame * 0.15) > 0 ? 1 : 0.4;

  return (
    <AbsoluteFill>
      <GradientBackground />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
          <FadeSlide delay={5} direction="right">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              AI Workout<br /><span style={{ color: C.brand }}>Coach</span>
            </h2>
          </FadeSlide>
          <FadeSlide delay={15} direction="right">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              Record your workout. The AI analyzes form, detects the exercise, and gives real-time corrections.
            </p>
          </FadeSlide>
          <FadeSlide delay={30} direction="right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Exercise detection', 'Form scoring (1-10)', 'Injury risk flags', 'Logged on-chain via PDA'].map((f, i) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: i === 3 ? C.solana : C.brand }} />
                  <span style={{ color: i === 3 ? C.solana : C.inkSoft, fontSize: 16, fontFamily: 'system-ui', fontWeight: i === 3 ? 600 : 400 }}>{f}</span>
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>

        <DeviceFrame enterDelay={10} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%' }}>
            {/* Camera view */}
            <FadeSlide delay={15}>
              <div
                style={{
                  height: 200,
                  borderRadius: 18,
                  background: `linear-gradient(180deg, rgba(28,35,32,0.9), rgba(123,175,142,0.05))`,
                  border: '0.5px solid rgba(240,237,232,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: 10,
                  fontSize: 50,
                  overflow: 'hidden',
                }}
              >
                🏋️
                {frame > 30 && frame < 150 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(207,113,113,0.3)',
                      padding: '3px 8px',
                      borderRadius: 99,
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: C.danger, opacity: recPulse }} />
                    <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: 'system-ui' }}>REC</span>
                  </div>
                )}
                {frame > 30 && frame < 150 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                  >
                    <div
                      style={{
                        background: `linear-gradient(90deg, ${C.danger}, ${C.danger})`,
                        borderRadius: 14,
                        padding: '8px 0',
                        textAlign: 'center',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'system-ui',
                      }}
                    >
                      Stop Recording
                    </div>
                  </div>
                )}
              </div>
            </FadeSlide>

            {/* Results */}
            {showResult && (
              <div style={{ opacity: resultEnter, transform: `translateY(${interpolate(resultEnter, [0, 1], [20, 0])}px)` }}>
                <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 16, padding: 12, border: '0.5px solid rgba(240,237,232,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: C.ink, fontWeight: 700, fontSize: 13, fontFamily: 'system-ui' }}>Barbell Squat</span>
                    <span style={{ background: `${C.mint}20`, color: C.mint, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: 'system-ui' }}>8/10</span>
                  </div>
                  {['Good depth — breaking parallel consistently', 'Keep chest up more at the bottom', 'Consider widening stance slightly'].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ width: 4, height: 4, borderRadius: 2, background: C.brand, marginTop: 5, flexShrink: 0 }} />
                      <span style={{ color: C.inkSoft, fontSize: 10, fontFamily: 'system-ui', lineHeight: 1.4 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DeviceFrame>
      </AbsoluteFill>

      <Caption text={VOICEOVER.workoutCoach} />
    </AbsoluteFill>
  );
};
