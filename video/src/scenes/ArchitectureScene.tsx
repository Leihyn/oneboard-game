import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../constants";
import { HEADING, MONO } from "../fonts";

const LEFT = [
  { name: "Next.js 15", desc: "Frontend + API routes", color: COLORS.accent },
  { name: "Move Contracts", desc: "game.move, board.move, property.move, player.move, token.move", color: COLORS.purple },
  { name: "Groq LLM", desc: "AI trash talk + decisions", color: COLORS.coral },
];

const RIGHT = [
  { name: "OneWallet", desc: "@onelabs/dapp-kit", color: COLORS.amber },
  { name: "OneChain Testnet", desc: "RPC + transaction signing", color: COLORS.accent },
  { name: "Dynamic NFTs", desc: "On-chain property ownership", color: COLORS.green },
];

export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps, from: 0, to: 1, config: { damping: 30 } });
  const arrowOp = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 40, background: COLORS.bg, padding: 80,
      }}
    >
      <div style={{ fontFamily: HEADING, fontSize: 48, fontWeight: 700, color: COLORS.white, opacity: titleOp }}>
        Architecture
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {/* Left: Application */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 420 }}>
          <div style={{ fontFamily: HEADING, fontSize: 14, color: COLORS.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            Application Layer
          </div>
          {LEFT.map((item, i) => {
            const delay = 15 + i * 14;
            const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 25 } });
            const x = spring({ frame: frame - delay, fps, from: 25, to: 0, config: { damping: 20 } });
            return (
              <div
                key={item.name}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderLeft: `4px solid ${item.color}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: item.color }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrow */}
        <div style={{ fontSize: 56, color: COLORS.accent, opacity: arrowOp, fontFamily: HEADING }}>
          ⟷
        </div>

        {/* Right: Infrastructure */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 420 }}>
          <div style={{ fontFamily: HEADING, fontSize: 14, color: COLORS.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
            Blockchain Layer
          </div>
          {RIGHT.map((item, i) => {
            const delay = 55 + i * 14;
            const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 25 } });
            const x = spring({ frame: frame - delay, fps, from: -25, to: 0, config: { damping: 20 } });
            return (
              <div
                key={item.name}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.border}`,
                  borderRight: `4px solid ${item.color}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: item.color }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
