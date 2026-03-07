import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

type Props = {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  style?: React.CSSProperties;
};

export const FadeSlide: React.FC<Props> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 24,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 28, stiffness: 60, mass: 1.2 },
  });

  const translate = interpolate(progress, [0, 1], [distance, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const transform =
    direction === 'up'
      ? `translateY(${translate}px)`
      : direction === 'down'
        ? `translateY(${-translate}px)`
        : direction === 'left'
          ? `translateX(${translate}px)`
          : `translateX(${-translate}px)`;

  return (
    <div style={{ transform, opacity, ...style }}>
      {children}
    </div>
  );
};
