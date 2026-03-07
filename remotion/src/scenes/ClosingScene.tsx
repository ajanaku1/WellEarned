import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, staticFile, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 10, stiffness: 50 } });
  const pulseScale = 1 + Math.sin(frame * 0.04) * 0.015;
  const glowIntensity = interpolate(frame, [0, 120], [0.3, 0.8], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <GradientBackground />

      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i * 137.5) % 100;
        const y = (i * 83.7) % 100;
        const drift = Math.sin((frame + i * 15) * 0.015) * 20;
        const driftX = Math.cos((frame + i * 20) * 0.012) * 10;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: i % 5 === 0 ? 4 : 2,
              height: i % 5 === 0 ? 4 : 2,
              borderRadius: '50%',
              background: i % 4 === 0 ? C.brand : i % 4 === 1 ? C.lavender : i % 4 === 2 ? C.solana : C.cyan,
              opacity: 0.12 + Math.sin((frame + i * 10) * 0.02) * 0.08,
              transform: `translate(${driftX}px, ${drift}px)`,
            }}
          />
        );
      })}

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 }}>
        {/* Logo glow */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.brand}30 0%, transparent 70%)`,
            opacity: glowIntensity,
            filter: 'blur(40px)',
          }}
        />

        {/* Logo */}
        <Img
          src={staticFile('logo.png')}
          style={{
            width: 140,
            height: 140,
            borderRadius: 35,
            transform: `scale(${logoScale * pulseScale})`,
            boxShadow: `0 0 60px ${C.brand}25`,
          }}
        />

        <FadeSlide delay={20}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: C.ink,
              fontFamily: 'system-ui',
              letterSpacing: -2,
              margin: 0,
              textAlign: 'center',
            }}
          >
            Well<span style={{ color: C.brand }}>Earned</span>
          </h1>
        </FadeSlide>

        <FadeSlide delay={35}>
          <p style={{ fontSize: 24, color: C.inkSoft, fontFamily: 'system-ui', margin: 0, textAlign: 'center', letterSpacing: -0.3 }}>
            Build habits. Prove them on-chain. Earn crypto.
          </p>
        </FadeSlide>

        {/* Tech stack row */}
        <FadeSlide delay={50}>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {[
              { label: 'Anchor Program', color: C.solana },
              { label: 'Gemini AI', color: C.lavender },
              { label: 'On-Chain Verified', color: C.cyan },
              { label: 'SHA-256 Hashing', color: C.brand },
            ].map((b) => (
              <div
                key={b.label}
                style={{
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: `${b.color}10`,
                  border: `1px solid ${b.color}20`,
                }}
              >
                <span style={{ color: b.color, fontSize: 15, fontWeight: 600, fontFamily: 'system-ui' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </FadeSlide>

        {/* Features summary */}
        <FadeSlide delay={70}>
          <div style={{ display: 'flex', gap: 30, marginTop: 16 }}>
            {[
              { icon: '📸', label: 'AI Meal Analysis' },
              { icon: '🏋️', label: 'Form Coaching' },
              { icon: '🎙️', label: 'Voice Mood' },
              { icon: '🔗', label: 'On-Chain Proof' },
              { icon: '💰', label: 'Verified Rewards' },
            ].map((f) => (
              <div key={f.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28 }}>{f.icon}</div>
                <div style={{ color: C.inkSoft, fontSize: 11, fontWeight: 500, fontFamily: 'system-ui', marginTop: 4 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </FadeSlide>
      </AbsoluteFill>

      <Caption text={VOICEOVER.closing} />
    </AbsoluteFill>
  );
};
