import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { C } from '../constants';

type Props = {
  text: string;
  delay?: number;
};

export const Caption: React.FC<Props> = ({ text, delay = 15 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Smooth fade in
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 30, stiffness: 50, mass: 1.2 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  // Smooth fade out at the end of each scene
  const fadeOutStart = durationInFrames - 20;
  const fadeOut = interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity: opacity * fadeOut,
        maxWidth: 900,
        padding: '16px 32px',
        background: 'rgba(15, 18, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(240,237,232,0.08)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          color: C.ink,
          fontSize: 22,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: -0.2,
        }}
      >
        {text}
      </span>
    </div>
  );
};
