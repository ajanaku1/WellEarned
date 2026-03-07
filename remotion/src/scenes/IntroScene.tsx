import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, staticFile, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { FadeSlide } from '../components/FadeSlide';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoScale = spring({ frame, fps, config: { damping: 22, stiffness: 40, mass: 1.3 } });
  const logoRotate = interpolate(logoScale, [0, 1], [10, 0]);
  const glowOpacity = interpolate(frame, [30, 90], [0, 0.6], { extrapolateRight: 'clamp' });
  const pulseScale = 1 + Math.sin(frame * 0.05) * 0.02;

  // Title
  const titleProgress = spring({ frame: frame - 30, fps, config: { damping: 26, stiffness: 50, mass: 1.2 } });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  // Tagline
  const tagProgress = spring({ frame: frame - 50, fps, config: { damping: 26, stiffness: 50, mass: 1.2 } });

  // Badge row
  const badgesIn = spring({ frame: frame - 75, fps, config: { damping: 26, stiffness: 50, mass: 1.2 } });

  return (
    <AbsoluteFill>
      <GradientBackground />

      {/* Particle dots */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (i * 137.5) % 100;
        const y = (i * 97.3) % 100;
        const delay = i * 0.7;
        const drift = Math.sin((frame + delay * 30) * 0.02) * 15;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: i % 3 === 0 ? C.brand : i % 3 === 1 ? C.lavender : C.cyan,
              opacity: 0.15 + Math.sin((frame + i * 20) * 0.03) * 0.1,
              transform: `translateY(${drift}px)`,
            }}
          />
        );
      })}

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        {/* Logo glow */}
        <div
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.brand}40 0%, transparent 70%)`,
            opacity: glowOpacity,
            filter: 'blur(30px)',
          }}
        />

        {/* Logo */}
        <Img
          src={staticFile('logo.png')}
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            transform: `scale(${logoScale * pulseScale}) rotate(${logoRotate}deg)`,
            boxShadow: `0 0 40px ${C.brand}30`,
          }}
        />

        {/* Title */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleProgress,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: C.ink,
              fontFamily: 'system-ui',
              letterSpacing: -2,
              margin: 0,
            }}
          >
            Well<span style={{ color: C.brand }}>Earned</span>
          </h1>
        </div>

        {/* Tagline */}
        <div style={{ opacity: tagProgress, transform: `translateY(${interpolate(tagProgress, [0, 1], [20, 0])}px)` }}>
          <p
            style={{
              fontSize: 26,
              color: C.inkSoft,
              fontFamily: 'system-ui',
              fontWeight: 400,
              margin: 0,
              letterSpacing: -0.3,
            }}
          >
            Build healthy habits. Earn crypto rewards.
          </p>
        </div>

        {/* Tech badges */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 16,
            opacity: badgesIn,
            transform: `translateY(${interpolate(badgesIn, [0, 1], [20, 0])}px)`,
          }}
        >
          {[
            { label: 'Gemini AI', color: C.lavender },
            { label: 'Solana', color: C.solana },
            { label: 'Mobile Stack', color: C.cyan },
          ].map((b) => (
            <div
              key={b.label}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                background: `${b.color}12`,
                border: `1px solid ${b.color}25`,
              }}
            >
              <span style={{ color: b.color, fontSize: 15, fontWeight: 600, fontFamily: 'system-ui' }}>
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <Caption text={VOICEOVER.intro} delay={15} />
    </AbsoluteFill>
  );
};
