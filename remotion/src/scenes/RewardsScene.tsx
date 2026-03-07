import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const RewardsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const claimFlash = frame > 240 && frame < 270;
  const claimDone = frame > 270;
  const claimEnter = spring({ frame: frame - 270, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });

  // Multiplier progress animation
  const multiplierEnter = spring({ frame: frame - 120, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });
  const barProgress = interpolate(frame, [130, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Streak grid
  const streakDays = Array.from({ length: 42 }).map((_, i) => i < 28 + Math.floor(i / 7));

  return (
    <AbsoluteFill>
      <GradientBackground variant="cool" />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        <DeviceFrame enterDelay={5} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%', overflow: 'hidden' }}>
            <FadeSlide delay={10}>
              <div style={{ color: C.ink, fontSize: 17, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 12, letterSpacing: -0.3 }}>Rewards</div>
            </FadeSlide>

            {/* Streak Hero */}
            <FadeSlide delay={15}>
              <div
                style={{
                  background: 'rgba(28,35,32,0.75)',
                  borderRadius: 18,
                  padding: 14,
                  border: `1px solid ${C.brand}30`,
                  marginBottom: 8,
                  boxShadow: `0 4px 20px ${C.brand}15`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: C.inkMuted, fontSize: 8, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, fontFamily: 'system-ui' }}>Current Streak</div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: 'system-ui' }}>14</div>
                    <div style={{ color: C.inkSoft, fontSize: 10, fontFamily: 'system-ui' }}>consecutive days</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        background: `${C.brand}15`,
                        border: `1.5px solid ${C.brand}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ color: C.brand, fontWeight: 700, fontSize: 16, fontFamily: 'system-ui' }}>2x</span>
                    </div>
                    <div style={{ color: C.mint, fontSize: 10, fontWeight: 600, fontFamily: 'system-ui', marginTop: 4 }}>20 SKR</div>
                  </div>
                </div>
              </div>
            </FadeSlide>

            {/* Today - 2 of 3 required */}
            <FadeSlide delay={25}>
              <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 14, padding: 10, border: '0.5px solid rgba(240,237,232,0.06)', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: C.ink, fontWeight: 700, fontSize: 12, fontFamily: 'system-ui' }}>Today</span>
                  <span style={{ color: C.brand, fontSize: 10, fontWeight: 600, fontFamily: 'system-ui' }}>3/2 required</span>
                </div>
                {[
                  { label: 'Meal logged', done: true, color: C.mint },
                  { label: 'Workout done', done: true, color: C.brand },
                  { label: 'Mood checked', done: true, color: C.amber },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: item.color, fontSize: 9, fontWeight: 700 }}>&#10003;</span>
                    </div>
                    <span style={{ color: C.ink, fontSize: 10, fontFamily: 'system-ui' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeSlide>

            {/* Multiplier Status */}
            <FadeSlide delay={40}>
              <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 14, padding: 10, border: `0.5px solid ${C.brand}20`, marginBottom: 8, opacity: multiplierEnter }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: `${C.brand}15`, border: `1px solid ${C.brand}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: C.brand, fontSize: 10, fontWeight: 700 }}>&#215;</span>
                  </div>
                  <span style={{ color: C.brand, fontWeight: 700, fontSize: 10, fontFamily: 'system-ui' }}>Multiplier Active (2x)</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                  {[...Array(7)].map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < Math.round(barProgress * 5) ? C.brand : 'rgba(240,237,232,0.06)' }} />
                  ))}
                </div>
                <span style={{ color: C.inkMuted, fontSize: 7, fontFamily: 'system-ui' }}>5/7 active days this week</span>
              </div>
            </FadeSlide>

            {/* Claim Button */}
            <FadeSlide delay={55}>
              <div
                style={{
                  background: claimFlash
                    ? `linear-gradient(90deg, ${C.mint}, ${C.cyan})`
                    : claimDone
                      ? `linear-gradient(90deg, ${C.brand}, ${C.brandDeep})`
                      : `linear-gradient(90deg, ${C.mint}, ${C.cyan})`,
                  borderRadius: 16,
                  padding: '12px 0',
                  textAlign: 'center',
                  marginBottom: 8,
                  transform: claimFlash ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: claimFlash ? `0 0 30px ${C.mint}40` : 'none',
                }}
              >
                <span style={{ color: '#0F1210', fontWeight: 700, fontSize: 12, fontFamily: 'system-ui' }}>
                  {claimDone ? '&#10003; 20 SKR Claimed!' : claimFlash ? 'Verifying on-chain...' : 'Claim 20 SKR'}
                </span>
              </div>
            </FadeSlide>

            {/* On-chain activity stats */}
            {claimDone && (
              <div style={{ opacity: claimEnter, transform: `translateY(${interpolate(claimEnter, [0, 1], [15, 0])}px)` }}>
                <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 12, padding: 10, border: '0.5px solid rgba(240,237,232,0.06)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: 3, background: C.solana }} />
                    <span style={{ color: C.ink, fontWeight: 700, fontSize: 10, fontFamily: 'system-ui' }}>On-Chain Activity</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                      { label: 'Meals', value: '42', color: C.mint },
                      { label: 'Workouts', value: '38', color: C.brand },
                      { label: 'Moods', value: '45', color: C.amber },
                    ].map((s) => (
                      <div key={s.label} style={{ flex: 1, background: 'rgba(28,35,32,0.8)', borderRadius: 8, padding: '6px 4px', textAlign: 'center', border: '0.5px solid rgba(240,237,232,0.04)' }}>
                        <div style={{ color: s.color, fontWeight: 700, fontSize: 14, fontFamily: 'system-ui' }}>{s.value}</div>
                        <div style={{ color: C.inkMuted, fontSize: 7, fontWeight: 600, fontFamily: 'system-ui' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Explorer link */}
                <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 10, padding: 8, border: '0.5px solid rgba(240,237,232,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: C.solana, fontSize: 9, fontWeight: 600, fontFamily: 'system-ui' }}>5Kxj8f...v3nQ2p</div>
                      <div style={{ color: C.inkMuted, fontSize: 7, fontFamily: 'system-ui' }}>Just now</div>
                    </div>
                    <span style={{ color: C.cyan, fontSize: 8, fontWeight: 600, fontFamily: 'system-ui' }}>Explorer &rarr;</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DeviceFrame>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
          <FadeSlide delay={10} direction="left">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              On-Chain<br /><span style={{ color: C.solana }}>Verified</span> Rewards
            </h2>
          </FadeSlide>
          <FadeSlide delay={20} direction="left">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              Our Anchor program checks activity PDAs exist before releasing rewards. No proof of activity, no tokens.
            </p>
          </FadeSlide>
          <FadeSlide delay={35} direction="left">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { text: '2+ activities required to claim', color: C.brand },
                { text: '3 full days/week for multipliers', color: C.mint },
                { text: 'SHA-256 content hashing', color: C.cyan },
                { text: 'Type-specific PDAs per activity', color: C.solana },
              ].map((f) => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: f.color }} />
                  <span style={{ color: C.inkSoft, fontSize: 15, fontFamily: 'system-ui' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </FadeSlide>
          <FadeSlide delay={50} direction="left">
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: '7 days', mult: '1.5x', color: C.brand },
                { label: '14 days', mult: '2x', color: C.mint },
                { label: '30 days', mult: '3x', color: C.solana },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px 6px',
                    borderRadius: 14,
                    background: `${m.color}10`,
                    border: `1px solid ${m.color}20`,
                  }}
                >
                  <div style={{ color: m.color, fontWeight: 700, fontSize: 18, fontFamily: 'system-ui' }}>{m.mult}</div>
                  <div style={{ color: C.inkSoft, fontSize: 11, fontFamily: 'system-ui', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>
      </AbsoluteFill>

      <Caption text={VOICEOVER.rewards} />
    </AbsoluteFill>
  );
};
