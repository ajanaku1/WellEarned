import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
  text: string;
  startFrame?: number;
  speed?: number;
  style?: React.CSSProperties;
};

export const TypewriterText: React.FC<Props> = ({
  text,
  startFrame = 0,
  speed = 1.5,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(Math.floor(elapsed * speed), text.length);
  const displayText = text.slice(0, charsToShow);
  const showCursor = elapsed > 0 && charsToShow < text.length;

  return (
    <span style={style}>
      {displayText}
      {showCursor && (
        <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: 'inherit' }}>|</span>
      )}
    </span>
  );
};
