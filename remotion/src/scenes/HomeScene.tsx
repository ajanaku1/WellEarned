import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, staticFile, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

const CheckItem: React.FC<{ label: string; done: boolean; delay: number }> = ({ label, done, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        opacity: enter,
        transform: `translateX(${interpolate(enter, [0, 1], [20, 0])}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: done ? `${C.mint}25` : 'rgba(240,237,232,0.06)',
            border: done ? `1.5px solid ${C.mint}` : '1px solid rgba(240,237,232,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: C.mint,
          }}
        >
          {done && '✓'}
        </div>
        <span style={{ color: done ? C.ink : C.inkMuted, fontSize: 12, fontFamily: 'system-ui', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: done ? C.mint : C.inkMuted,
          background: done ? `${C.mint}15` : 'rgba(240,237,232,0.04)',
          padding: '3px 8px',
          borderRadius: 99,
        }}
      >
        {done ? 'DONE' : 'PENDING'}
      </span>
    </div>
  );
};

export const HomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate check items completing over time
  const mealDone = frame > 60;
  const workoutDone = frame > 120;
  const moodDone = frame > 180;

  return (
    <AbsoluteFill>
      <GradientBackground />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        {/* Phone */}
        <DeviceFrame enterDelay={5} scale={0.95}>
          <div style={{ padding: 16, background: C.surface, height: '100%' }}>
            {/* Header */}
            <FadeSlide delay={15}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Img
                  src={staticFile('logo.png')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                  }}
                />
                <div>
                  <div style={{ color: C.inkMuted, fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 1, fontFamily: 'system-ui' }}>Good morning</div>
                  <div style={{ color: C.ink, fontSize: 17, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -0.3 }}>WellEarned</div>
                </div>
              </div>
            </FadeSlide>

            {/* Stats */}
            <FadeSlide delay={25}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  { label: 'Meals', value: 12, color: C.mint },
                  { label: 'Workouts', value: 8, color: C.brand },
                  { label: 'Moods', value: 15, color: C.amber },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      background: 'rgba(28,35,32,0.7)',
                      borderRadius: 16,
                      padding: '10px 6px',
                      textAlign: 'center',
                      border: '0.5px solid rgba(240,237,232,0.06)',
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'system-ui' }}>{s.value}</div>
                    <div style={{ fontSize: 8, color: C.inkSoft, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, fontFamily: 'system-ui' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeSlide>

            {/* Today card */}
            <FadeSlide delay={35}>
              <div
                style={{
                  background: 'rgba(28,35,32,0.7)',
                  borderRadius: 18,
                  padding: 14,
                  border: '0.5px solid rgba(240,237,232,0.08)',
                  marginBottom: 14,
                }}
              >
                <div style={{ color: C.ink, fontSize: 14, fontWeight: 700, fontFamily: 'system-ui', marginBottom: 6 }}>Today</div>
                <CheckItem label="Log a meal" done={mealDone} delay={45} />
                <CheckItem label="Complete a workout" done={workoutDone} delay={55} />
                <CheckItem label="Check in on mood" done={moodDone} delay={65} />
              </div>
            </FadeSlide>

            {/* Daily Tip */}
            <FadeSlide delay={75}>
              <div
                style={{
                  background: 'rgba(28,35,32,0.7)',
                  borderRadius: 18,
                  padding: 14,
                  border: '0.5px solid rgba(240,237,232,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: C.lavender }} />
                  <span style={{ color: C.ink, fontSize: 14, fontWeight: 700, fontFamily: 'system-ui' }}>Daily Tip</span>
                  <span style={{ background: `${C.lavender}12`, padding: '2px 8px', borderRadius: 99, color: C.lavender, fontSize: 9, fontWeight: 600, fontFamily: 'system-ui' }}>AI</span>
                </div>
                <div style={{ color: C.inkSoft, fontSize: 11, lineHeight: 1.5, fontFamily: 'system-ui' }}>
                  Your protein intake has been lower this week. Try adding Greek yogurt or eggs to your breakfast for sustained energy.
                </div>
              </div>
            </FadeSlide>
          </div>
        </DeviceFrame>

        {/* Right side feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
          <FadeSlide delay={20} direction="left">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              Your Wellness<br />Dashboard
            </h2>
          </FadeSlide>
          <FadeSlide delay={35} direction="left">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              Track meals, workouts, and moods in one place. AI-powered daily tips personalized to your actual data.
            </p>
          </FadeSlide>
          {[
            { icon: '🍽️', label: 'AI Meal Analysis', color: C.mint },
            { icon: '🏋️', label: 'Form Coaching', color: C.brand },
            { icon: '🧠', label: 'Mood Tracking', color: C.amber },
          ].map((f, i) => (
            <FadeSlide key={f.label} delay={50 + i * 12} direction="left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  {f.icon}
                </div>
                <span style={{ color: C.ink, fontSize: 18, fontWeight: 600, fontFamily: 'system-ui' }}>{f.label}</span>
              </div>
            </FadeSlide>
          ))}
        </div>
      </AbsoluteFill>

      <Caption text={VOICEOVER.home} />
    </AbsoluteFill>
  );
};
