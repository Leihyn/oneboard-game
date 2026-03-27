import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../constants";
import { HEADING, BODY } from "../fonts";
import { FadeIn } from "../components/FadeIn";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Phase 1: The problem (0-140)
  const p1 = interpolate(frame, [0, 15, 130, 150], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phase 2: The punchline (140-300)
  const p2 = interpolate(frame, [140, 165], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: COLORS.bg, padding: 80,
      }}
    >
      {/* Phase 1 */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p1, padding: 120 }}>
        <div style={{ fontFamily: HEADING, fontSize: 52, fontWeight: 700, color: COLORS.coral, textAlign: "center", lineHeight: 1.3, maxWidth: 1000 }}>
          DeFi is intimidating.
        </div>
        <div style={{ fontFamily: BODY, fontSize: 28, color: COLORS.muted, marginTop: 28, textAlign: "center", maxWidth: 800, lineHeight: 1.6 }}>
          Liquidity pools, staking, yield farming, MEV. The jargon alone keeps millions of users from ever touching on-chain protocols.
        </div>
        <div style={{ fontFamily: BODY, fontSize: 24, color: COLORS.muted, marginTop: 40, opacity: 0.6 }}>
          Meanwhile, blockchain games feel like thinly veiled token farms.
        </div>
      </div>

      {/* Phase 2 */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: p2 }}>
        <div style={{ fontFamily: HEADING, fontSize: 44, color: COLORS.muted, marginBottom: 16 }}>
          What if learning DeFi felt like...
        </div>
        <div style={{ fontFamily: HEADING, fontSize: 72, fontWeight: 700, color: COLORS.amber }}>
          a Friday night board game?
        </div>
      </div>
    </div>
  );
};
