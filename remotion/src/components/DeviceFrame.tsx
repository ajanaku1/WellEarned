import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { C } from '../constants';

type Props = {
  children: React.ReactNode;
  enterDelay?: number;
  scale?: number;
};

export const DeviceFrame: React.FC<Props> = ({ children, enterDelay = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 26, stiffness: 50, mass: 1.3 },
  });
  const translateY = interpolate(entrance, [0, 1], [50, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scaleIn = interpolate(entrance, [0, 1], [0.92, 1]);

  const phoneWidth = 320 * scale;
  const phoneHeight = 680 * scale;

  return (
    <div
      style={{
        width: phoneWidth,
        height: phoneHeight,
        borderRadius: 40 * scale,
        border: `2px solid rgba(240,237,232,0.12)`,
        background: C.surface,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(123,175,142,0.08)`,
        transform: `translateY(${translateY}px) scale(${scaleIn})`,
        opacity,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120 * scale,
          height: 28 * scale,
          background: '#000',
          borderBottomLeftRadius: 16 * scale,
          borderBottomRightRadius: 16 * scale,
          zIndex: 10,
        }}
      />
      {/* Status bar */}
      <div
        style={{
          height: 44 * scale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${20 * scale}px`,
          fontSize: 11 * scale,
          color: C.inkSoft,
          fontFamily: 'system-ui',
          fontWeight: 600,
          zIndex: 5,
          position: 'relative',
        }}
      >
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span>●●●●</span>
          <span>🔋</span>
        </span>
      </div>
      {/* Screen content */}
      <div
        style={{
          position: 'absolute',
          top: 44 * scale,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
