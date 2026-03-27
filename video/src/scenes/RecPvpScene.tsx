import { useCurrentFrame, useVideoConfig, interpolate, staticFile, AbsoluteFill, OffthreadVideo } from "remotion";
import { COLORS } from "../constants";
import { HEADING } from "../fonts";
import { GradientOverlay } from "../components/GradientOverlay";
import { FloatingCallout } from "../components/FloatingCallout";

export const RecPvpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title (0-60)
  const titleOp = interpolate(frame, [0, 15, 45, 65], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Video
  const videoOp = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Title */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: titleOp, zIndex: 5 }}>
        <div style={{ fontFamily: HEADING, fontSize: 18, color: COLORS.amber, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>
          Multiplayer
        </div>
        <div style={{ fontFamily: HEADING, fontSize: 52, fontWeight: 700, color: COLORS.white }}>
          PvP On-Chain
        </div>
      </AbsoluteFill>

      {/* Recording */}
      <AbsoluteFill style={{ opacity: videoOp }}>
        <OffthreadVideo
          src={staticFile("recording-pvp.mp4")}
          startFrom={2 * 30}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <GradientOverlay position="both" opacity={0.6} />

        <FloatingCallout
          text="Create or Join Lobbies"
          subtext="2-4 players, fully on-chain state"
          enterFrame={70}
          exitFrame={300}
          color={COLORS.amber}
          style={{ top: 100, right: 80 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
