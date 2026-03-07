import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C } from '../constants';

export const GradientBackground: React.FC<{ variant?: 'default' | 'warm' | 'cool' }> = ({
  variant = 'default',
}) => {
  const frame = useCurrentFrame();

  const orbX1 = interpolate(frame % 600, [0, 300, 600], [0, 30, 0]);
  const orbY1 = interpolate(frame % 800, [0, 400, 800], [0, -20, 0]);
  const orbX2 = interpolate(frame % 700, [0, 350, 700], [0, -25, 0]);
  const orbY2 = interpolate(frame % 500, [0, 250, 500], [0, 30, 0]);

  const colors =
    variant === 'warm'
      ? { orb1: 'rgba(212,167,106,0.08)', orb2: 'rgba(165,148,201,0.06)' }
      : variant === 'cool'
        ? { orb1: 'rgba(123,188,197,0.08)', orb2: 'rgba(123,175,142,0.06)' }
        : { orb1: 'rgba(123,175,142,0.08)', orb2: 'rgba(165,148,201,0.05)' };

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg} 0%, ${C.surface} 100%)` }}>
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.orb1} 0%, transparent 70%)`,
          top: -100 + orbY1,
          right: -100 + orbX1,
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.orb2} 0%, transparent 70%)`,
          bottom: -50 + orbY2,
          left: -80 + orbX2,
          filter: 'blur(50px)',
        }}
      />
    </AbsoluteFill>
  );
};
