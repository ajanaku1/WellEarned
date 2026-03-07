import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const InsightsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated chart points
  const chartProgress = interpolate(frame, [30, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const moodData = [6, 7, 5, 8, 7, 9, 8];

  const insightsEnter = spring({ frame: frame - 200, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });

  return (
    <AbsoluteFill>
      <GradientBackground />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
          <FadeSlide delay={5} direction="right">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              Cross-Feature<br /><span style={{ color: C.lavender }}>AI Insights</span>
            </h2>
          </FadeSlide>
          <FadeSlide delay={15} direction="right">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              AI finds patterns across meals, workouts, and moods that you'd never notice on your own.
            </p>
          </FadeSlide>
          <FadeSlide delay={30} direction="right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Mood trend charts', 'Workout location map', 'Cross-data correlations', 'Weekly AI summaries'].map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: C.lavender }} />
                  <span style={{ color: C.inkSoft, fontSize: 16, fontFamily: 'system-ui' }}>{f}</span>
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>

        <DeviceFrame enterDelay={10} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%' }}>
            <FadeSlide delay={15}>
              <div style={{ color: C.ink, fontSize: 17, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 12, letterSpacing: -0.3 }}>Insights</div>
            </FadeSlide>

            {/* Streak badge */}
            <FadeSlide delay={20}>
              <div style={{ background: `${C.brand}10`, border: `1px solid ${C.brand}25`, borderRadius: 16, padding: 12, marginBottom: 10, boxShadow: `0 4px 16px ${C.brand}10` }}>
                <div style={{ color: C.inkMuted, fontSize: 8, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, fontFamily: 'system-ui' }}>Consistency</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: C.brand, fontFamily: 'system-ui' }}>14</span>
                  <span style={{ color: C.inkSoft, fontSize: 11, fontFamily: 'system-ui' }}>day streak</span>
                </div>
              </div>
            </FadeSlide>

            {/* Mood Chart */}
            <FadeSlide delay={30}>
              <div style={{ background: 'rgba(28,35,32,0.7)', borderRadius: 16, padding: 12, border: '0.5px solid rgba(240,237,232,0.08)', marginBottom: 10 }}>
                <div style={{ color: C.ink, fontSize: 12, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 8 }}>Mood Curve</div>
                <svg width="100%" height="100" viewBox="0 0 260 100">
                  {/* Grid lines */}
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(240,237,232,0.04)" strokeWidth="1" />
                  ))}
                  {/* Line */}
                  <polyline
                    points={moodData
                      .map((v, i) => {
                        const x = 20 + i * 35;
                        const y = 90 - v * 8;
                        const progress = Math.min(1, chartProgress * moodData.length - i);
                        return progress > 0 ? `${x},${y}` : null;
                      })
                      .filter(Boolean)
                      .join(' ')}
                    fill="none"
                    stroke={C.brand}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {moodData.map((v, i) => {
                    const x = 20 + i * 35;
                    const y = 90 - v * 8;
                    const progress = Math.min(1, chartProgress * moodData.length - i);
                    if (progress <= 0) return null;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={C.surface}
                        stroke={C.brand}
                        strokeWidth="2"
                        opacity={progress}
                      />
                    );
                  })}
                  {/* Labels */}
                  {moodData.map((_, i) => (
                    <text key={i} x={20 + i * 35} y="98" fill={C.inkMuted} fontSize="7" textAnchor="middle" fontFamily="system-ui">
                      D{i + 1}
                    </text>
                  ))}
                </svg>
              </div>
            </FadeSlide>

            {/* AI Insights */}
            {frame > 200 && (
              <div style={{ opacity: insightsEnter, transform: `translateY(${interpolate(insightsEnter, [0, 1], [15, 0])}px)` }}>
                {[
                  { title: 'Nutrition-Mood Link', desc: 'Higher protein days correlate with 20% better mood scores.' },
                  { title: 'Optimal Workout Time', desc: 'Your form scores are highest during morning sessions.' },
                ].map((insight) => (
                  <div
                    key={insight.title}
                    style={{
                      background: `${C.brand}10`,
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 6,
                      border: `0.5px solid ${C.brand}18`,
                    }}
                  >
                    <div style={{ color: C.ink, fontWeight: 600, fontSize: 11, fontFamily: 'system-ui', marginBottom: 2 }}>{insight.title}</div>
                    <div style={{ color: C.inkSoft, fontSize: 9, fontFamily: 'system-ui', lineHeight: 1.4 }}>{insight.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DeviceFrame>
      </AbsoluteFill>

      <Caption text={VOICEOVER.insights} />
    </AbsoluteFill>
  );
};
