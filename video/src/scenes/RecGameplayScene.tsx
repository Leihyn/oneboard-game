import { useCurrentFrame, useVideoConfig, interpolate, staticFile, AbsoluteFill, OffthreadVideo } from "remotion";
import { COLORS } from "../constants";
import { HEADING } from "../fonts";
import { GradientOverlay } from "../components/GradientOverlay";
import { FloatingCallout } from "../components/FloatingCallout";

export const RecGameplayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title intro (0-75)
  const titleOp = interpolate(frame, [0, 15, 55, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Video
  const videoOp = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const videoScale = interpolate(frame, [50, 120], [1.02, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Title */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: titleOp, zIndex: 5 }}>
        <div style={{ fontFamily: HEADING, fontSize: 18, color: COLORS.accent, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
          Step 2
        </div>
        <div style={{ fontFamily: HEADING, fontSize: 52, fontWeight: 700, color: COLORS.white }}>
          Roll, Buy, Outsmart the AI
        </div>
      </AbsoluteFill>

      {/* Recording */}
      <AbsoluteFill style={{ opacity: videoOp }}>
        <OffthreadVideo
          src={staticFile("recording-gameplay.mp4")}
          startFrom={0}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${videoScale})`,
          }}
        />
        <GradientOverlay position="both" opacity={0.5} />

        <FloatingCallout
          text="Roll Dice"
          subtext="Move around 16 OneChain protocol spaces"
          enterFrame={80}
          exitFrame={280}
          color={COLORS.coral}
          style={{ top: 80, left: 80 }}
        />
        <FloatingCallout
          text="Buy Properties"
          subtext="Each purchase mints a Dynamic NFT on-chain"
          enterFrame={250}
          exitFrame={480}
          color={COLORS.accent}
          style={{ top: 80, right: 80 }}
        />
        <FloatingCallout
          text="AI Trash Talk"
          subtext="Groq LLM generates personality-driven responses"
          enterFrame={440}
          exitFrame={680}
          color={COLORS.amber}
          style={{ bottom: 120, right: 80 }}
        />
        <FloatingCallout
          text="Live Game Feed"
          subtext="Every roll, purchase, and rent payment logged"
          enterFrame={620}
          exitFrame={850}
          color={COLORS.green}
          style={{ bottom: 120, left: 80 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
