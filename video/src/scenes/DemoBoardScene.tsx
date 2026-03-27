import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img, AbsoluteFill } from "remotion";
import { COLORS } from "../constants";
import { HEADING } from "../fonts";
import { GradientOverlay } from "../components/GradientOverlay";
import { FloatingCallout } from "../components/FloatingCallout";

export const DemoBoardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Full-screen screenshot with gentle zoom
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const imgOp = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Section title that fades in then out
  const titleOp = interpolate(frame, [0, 15, 60, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Real screenshot of the homepage */}
      <Img
        src={staticFile("screenshot-home.png")}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${zoom})`, transformOrigin: "center center",
          opacity: imgOp,
        }}
      />
      <GradientOverlay position="both" opacity={0.8} />

      {/* Section label */}
      <div style={{
        position: "absolute", top: 40, left: 0, right: 0,
        display: "flex", justifyContent: "center", zIndex: 10, opacity: titleOp,
      }}>
        <div style={{
          fontFamily: HEADING, fontSize: 18, color: COLORS.accent,
          letterSpacing: 4, textTransform: "uppercase",
          background: "rgba(13,27,42,0.8)", padding: "8px 24px", borderRadius: 6,
          border: `1px solid ${COLORS.accent}40`,
        }}>
          Live Product
        </div>
      </div>

      {/* Callouts over the screenshot */}
      <FloatingCallout
        text="OneWallet Integration"
        subtext="Wallet required to play. Every action is on-chain"
        enterFrame={30}
        exitFrame={200}
        color={COLORS.accent}
        style={{ top: 160, right: 80 }}
      />
      <FloatingCallout
        text="3 AI Difficulty Levels"
        subtext="Easy, Normal, Hard. Each changes AI strategy"
        enterFrame={100}
        exitFrame={300}
        color={COLORS.amber}
        style={{ bottom: 350, left: 80 }}
      />
      <FloatingCallout
        text="Real OneChain Protocols"
        subtext="OneDEX, OneRWA, OCT Staking. Buy them all"
        enterFrame={200}
        exitFrame={450}
        color={COLORS.purple}
        style={{ top: 300, left: 100 }}
      />
      <FloatingCallout
        text="Move Smart Contracts"
        subtext="Game creation, dice rolls, purchases. All on-chain"
        enterFrame={340}
        exitFrame={550}
        color={COLORS.green}
        style={{ bottom: 200, right: 100 }}
      />
      <FloatingCallout
        text="PvP Multiplayer"
        subtext="Create lobby, share ID, play with friends on-chain"
        enterFrame={460}
        exitFrame={650}
        color={COLORS.coral}
        style={{ top: 250, right: 150 }}
      />
    </AbsoluteFill>
  );
};
