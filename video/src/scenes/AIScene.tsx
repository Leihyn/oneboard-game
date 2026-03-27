import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { COLORS } from "../constants";
import { HEADING, BODY } from "../fonts";

const AIS = [
  {
    name: "Degen Trader",
    color: "#ef4444",
    strategy: "Buys everything. YOLO.",
    quote: '"Ape in or get left behind!"',
    behavior: "High risk, trash talks constantly",
  },
  {
    name: "Conservative Whale",
    color: "#3b82f6",
    strategy: "Waits for value.",
    quote: '"Patience is the ultimate edge."',
    behavior: "Selective buyer, holds cash reserves",
  },
  {
    name: "MEV Bot",
    color: "#10b981",
    strategy: "Pure math. No mercy.",
    quote: '"Probability favors the prepared."',
    behavior: "Optimal decisions, exploits every advantage",
  },
];

export const AIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps, from: 0, to: 1, config: { damping: 30 } });
  const subOp = spring({ frame: frame - 15, fps, from: 0, to: 1, config: { damping: 30 } });

  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 44, background: COLORS.bg, padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: HEADING, fontSize: 48, fontWeight: 700, color: COLORS.white, opacity: titleOp }}>
          3 LLM-Powered AI Opponents
        </div>
        <div style={{ fontFamily: BODY, fontSize: 20, color: COLORS.muted, marginTop: 10, opacity: subOp }}>
          Groq (Llama 3.1) generates personality-driven trash talk in real-time
        </div>
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {AIS.map((ai, i) => {
          const delay = 25 + i * 15;
          const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 25 } });
          const y = spring({ frame: frame - delay, fps, from: 35, to: 0, config: { damping: 20 } });

          return (
            <div
              key={ai.name}
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderTop: `4px solid ${ai.color}`,
                borderRadius: 12,
                padding: "32px 28px",
                width: 320,
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              <div style={{ fontFamily: HEADING, fontSize: 24, fontWeight: 700, color: ai.color }}>
                {ai.name}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 16, color: COLORS.muted, marginTop: 6 }}>
                {ai.strategy}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 15, color: ai.color, marginTop: 14, fontStyle: "italic", opacity: 0.85 }}>
                {ai.quote}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: COLORS.muted, marginTop: 12, opacity: 0.7 }}>
                {ai.behavior}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
