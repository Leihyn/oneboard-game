import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, AbsoluteFill, OffthreadVideo } from "remotion";
import { COLORS } from "../constants";
import { HEADING } from "../fonts";
import { GradientOverlay } from "../components/GradientOverlay";
import { FloatingCallout } from "../components/FloatingCallout";

export const RecConnectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title intro (0-75 frames), fades out
  const titleOp = interpolate(frame, [0, 15, 55, 75], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Video crossfades in as title fades
  const videoOp = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const videoScale = interpolate(frame, [50, 120], [1.02, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Title card */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: titleOp, zIndex: 5 }}>
        <div style={{ fontFamily: HEADING, fontSize: 18, color: COLORS.accent, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
          Step 1
        </div>
        <div style={{ fontFamily: HEADING, fontSize: 52, fontWeight: 700, color: COLORS.white }}>
          Connect Wallet + Start Game
        </div>
      </AbsoluteFill>

      {/* Screen recording */}
      <AbsoluteFill style={{ opacity: videoOp }}>
        <OffthreadVideo
          src={staticFile("recording-connect.mp4")}
          startFrom={0}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${videoScale})`,
          }}
        />
        <GradientOverlay position="both" opacity={0.6} />

        <FloatingCallout
          text="OneWallet Required"
          subtext="Every game action is an on-chain transaction"
          enterFrame={90}
          exitFrame={350}
          color={COLORS.accent}
          style={{ top: 80, right: 80 }}
        />
        <FloatingCallout
          text="Creates Game On-Chain"
          subtext="Move smart contract: game::create_game"
          enterFrame={300}
          exitFrame={550}
          color={COLORS.purple}
          style={{ bottom: 120, left: 80 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
