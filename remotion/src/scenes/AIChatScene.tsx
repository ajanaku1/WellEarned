import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { GradientBackground } from '../components/GradientBackground';
import { DeviceFrame } from '../components/DeviceFrame';
import { FadeSlide } from '../components/FadeSlide';
import { TypewriterText } from '../components/TypewriterText';
import { Caption } from '../components/Caption';
import { C, VOICEOVER } from '../constants';

const ChatBubble: React.FC<{
  text: string;
  isUser: boolean;
  delay: number;
  typewriter?: boolean;
}> = ({ text, isUser, delay, typewriter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 26, stiffness: 55, mass: 1.2 } });

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [15, 0])}px)`,
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})` : 'rgba(240,237,232,0.06)',
          border: isUser ? 'none' : '0.5px solid rgba(240,237,232,0.08)',
        }}
      >
        <span
          style={{
            color: isUser ? '#fff' : C.ink,
            fontSize: 11,
            fontFamily: 'system-ui',
            lineHeight: 1.5,
          }}
        >
          {typewriter ? <TypewriterText text={text} startFrame={delay + 10} speed={1.2} /> : text}
        </span>
      </div>
    </div>
  );
};

export const AIChatScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBackground variant="cool" />

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80 }}>
        {/* Left side text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
          <FadeSlide delay={5} direction="right">
            <h2 style={{ color: C.ink, fontSize: 36, fontWeight: 700, fontFamily: 'system-ui', letterSpacing: -1, margin: 0 }}>
              AI Wellness<br />
              <span style={{ color: C.brand }}>Coach</span>
            </h2>
          </FadeSlide>
          <FadeSlide delay={15} direction="right">
            <p style={{ color: C.inkSoft, fontSize: 18, fontFamily: 'system-ui', lineHeight: 1.6, margin: 0 }}>
              AI coach with function calling. Accesses your real wellness data for personalized coaching.
            </p>
          </FadeSlide>
          <FadeSlide delay={30} direction="right">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {['Tool Calling', 'Context-Aware', 'Streaming'].map((t) => (
                <div
                  key={t}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    background: `${C.brand}12`,
                    border: `1px solid ${C.brand}25`,
                    color: C.brand,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'system-ui',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </FadeSlide>
        </div>

        {/* Phone */}
        <DeviceFrame enterDelay={10} scale={0.95}>
          <div style={{ padding: 14, background: C.surface, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div
              style={{
                background: 'rgba(28,35,32,0.7)',
                borderRadius: '16px 16px 0 0',
                padding: '10px 14px',
                border: '0.5px solid rgba(240,237,232,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: 3, background: C.brand }} />
              <span style={{ color: C.ink, fontSize: 13, fontWeight: 700, fontFamily: 'system-ui' }}>Wellness Coach</span>
              <span style={{ background: `${C.brand}15`, padding: '2px 8px', borderRadius: 99, color: C.brandDeep, fontSize: 8, fontWeight: 700, fontFamily: 'system-ui' }}>LIVE</span>
            </div>

            {/* Chat area */}
            <div
              style={{
                flex: 1,
                background: 'rgba(28,35,32,0.5)',
                borderLeft: '0.5px solid rgba(240,237,232,0.08)',
                borderRight: '0.5px solid rgba(240,237,232,0.08)',
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <ChatBubble text="How is my nutrition this week?" isUser={true} delay={30} />
              <ChatBubble
                text="Based on your 5 logged meals this week, your average protein intake is 42g/day — that's below the recommended 56g. Your calorie balance looks good at ~2,100/day. I'd suggest adding a protein-rich snack like Greek yogurt."
                isUser={false}
                delay={60}
                typewriter
              />
              <ChatBubble text="What workout should I do today?" isUser={true} delay={220} />
              <ChatBubble
                text="You did upper body yesterday with a form score of 8/10. I recommend a 30-min lower body session today — squats and lunges would complement your routine."
                isUser={false}
                delay={250}
                typewriter
              />
            </div>

            {/* Input */}
            <div
              style={{
                background: 'rgba(28,35,32,0.7)',
                borderRadius: '0 0 16px 16px',
                padding: '10px 14px',
                border: '0.5px solid rgba(240,237,232,0.08)',
                display: 'flex',
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: 'rgba(240,237,232,0.04)',
                  borderRadius: 20,
                  padding: '7px 12px',
                  color: C.inkMuted,
                  fontSize: 10,
                  fontFamily: 'system-ui',
                  border: '0.5px solid rgba(240,237,232,0.06)',
                }}
              >
                Ask your wellness coach...
              </div>
              <div
                style={{
                  background: `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`,
                  borderRadius: 20,
                  padding: '7px 14px',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'system-ui',
                }}
              >
                Send
              </div>
            </div>
          </div>
        </DeviceFrame>
      </AbsoluteFill>

      <Caption text={VOICEOVER.aiChat} />
    </AbsoluteFill>
  );
};
