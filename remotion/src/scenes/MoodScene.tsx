import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const MoodScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showResult = frame > 180;
  const resultEnter = spring({ frame: frame - 180, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });
  const moodBarWidth = interpolate(frame, [200, 260], [0, 75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const waveAmp = frame > 30 && frame < 150 ? Math.sin(frame * 0.2) * 8 : 0;

  return (
    <AbsoluteFill>
      <GradientBackground variant="warm" />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        <DeviceFrame enterDelay={5} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%' }}>
            {/* Tabs */}
            <FadeSlide delay={10}>
              <div style={{ display: 'flex', background: 'rgba(240,237,232,0.04)', borderRadius: 99, padding: 2, marginBottom: 14 }}>
                {['Voice', 'Journal'].map((t, i) => (
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

            {/* Voice recording button */}
            <FadeSlide delay={20}>
              <div
                style={{
                  background: frame > 30 && frame < 150 ? `linear-gradient(135deg, ${C.danger}, ${C.danger})` : `linear-gradient(135deg, ${C.brand}, ${C.lavender})`,
                  borderRadius: 14,
                  padding: '16px 0',
                  textAlign: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'system-ui',
                  marginBottom: 10,
                }}
              >
                {frame < 30 ? '🎙️ Start Recording' : frame < 150 ? '⏹️ Stop Recording' : '🎙️ Re-record'}
              </div>
            </FadeSlide>

            {/* Waveform visualization */}
            {frame > 30 && frame < 150 && (
              <FadeSlide delay={35}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 40, marginBottom: 10 }}>
                  {Array.from({ length: 30 }).map((_, i) => {
                    const h = 8 + Math.abs(Math.sin((frame + i * 3) * 0.15)) * 20;
                    return (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          borderRadius: 2,
                          background: `linear-gradient(180deg, ${C.lavender}, ${C.brand})`,
                          opacity: 0.7,
                        }}
                      />
                    );
                  })}
                </div>
              </FadeSlide>
            )}

            {/* Ready badge */}
            {frame >= 150 && !showResult && (
              <FadeSlide delay={150}>
                <div style={{ background: `${C.mint}10`, borderRadius: 10, padding: '8px 14px', textAlign: 'center', border: `0.5px solid ${C.mint}30`, marginBottom: 10 }}>
                  <span style={{ color: C.mint, fontSize: 10, fontWeight: 600, fontFamily: 'system-ui' }}>Audio recorded and ready</span>
                </div>
              </FadeSlide>
            )}

            {/* Results */}
            {showResult && (
              <div style={{ opacity: resultEnter, transform: `translateY(${interpolate(resultEnter, [0, 1], [20, 0])}px)` }}>
                <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 16, padding: 12, border: '0.5px solid rgba(240,237,232,0.06)' }}>
                  <div style={{ color: C.ink, fontWeight: 700, fontSize: 13, fontFamily: 'system-ui', marginBottom: 10 }}>
                    Feeling motivated with mild stress
                  </div>
                  {/* Score bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: C.inkSoft, fontSize: 10, fontFamily: 'system-ui' }}>Mood Score</span>
                      <span style={{ color: C.mint, fontWeight: 700, fontSize: 12, fontFamily: 'system-ui' }}>7.5/10</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 99, background: 'rgba(240,237,232,0.04)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${moodBarWidth}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.mint}, ${C.cyan})` }} />
                    </div>
                  </div>
                  {/* Tip */}
                  <div style={{ background: 'rgba(240,237,232,0.03)', borderRadius: 10, padding: 10, marginBottom: 8, border: '0.5px solid rgba(240,237,232,0.06)' }}>
                    <div style={{ color: C.brandDeep, fontSize: 9, fontWeight: 600, fontFamily: 'system-ui', marginBottom: 3 }}>Wellness Tip</div>
                    <div style={{ color: C.inkSoft, fontSize: 10, fontFamily: 'system-ui', lineHeight: 1.4 }}>Try a 5-minute breathing exercise to manage that stress.</div>
                  </div>
                  {/* Affirmation */}
                  <div style={{ background: `${C.lavender}08`, borderRadius: 10, padding: 10, border: `0.5px solid ${C.lavender}20` }}>
                    <div style={{ color: C.lavender, fontSize: 10, fontStyle: 'italic', fontFamily: 'system-ui', lineHeight: 1.4 }}>
                      "You're making progress every single day."
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DeviceFrame>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
          <FadeSlide delay={10} direction="left">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              Voice <span style={{ color: C.lavender }}>Mood</span><br />Tracking
            </h2>
          </FadeSlide>
          <FadeSlide delay={20} direction="left">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              Speak your feelings. The AI analyzes tone and content to understand your emotional state.
            </p>
          </FadeSlide>
          <FadeSlide delay={35} direction="left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Voice emotion analysis', 'Journal text analysis', 'Mood scoring', 'Verified on Solana PDA'].map((f, i) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: i === 3 ? C.solana : C.lavender }} />
                  <span style={{ color: i === 3 ? C.solana : C.inkSoft, fontSize: 16, fontFamily: 'system-ui', fontWeight: i === 3 ? 600 : 400 }}>{f}</span>
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>
      </AbsoluteFill>

      <Caption text={VOICEOVER.moodTracker} />
    </AbsoluteFill>
  );
};
