import { useCurrentFrame, useVideoConfig, spring, staticFile, Img } from "remotion";
import { COLORS } from "../constants";
import { HEADING, BODY } from "../fonts";

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, from: 0.93, to: 1, config: { damping: 20 } });
  const logoOp = spring({ frame, fps, from: 0, to: 1, config: { damping: 30 } });
  const titleOp = spring({ frame: frame - 20, fps, from: 0, to: 1, config: { damping: 30 } });
  const titleY = spring({ frame: frame - 20, fps, from: 25, to: 0, config: { damping: 20 } });
  const subOp = spring({ frame: frame - 45, fps, from: 0, to: 1, config: { damping: 30 } });
  const tagOp = spring({ frame: frame - 70, fps, from: 0, to: 1, config: { damping: 30 } });

  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
        background: `radial-gradient(ellipse at center, ${COLORS.accentDim} 0%, ${COLORS.bg} 65%)`,
      }}
    >
      <Img
        src={staticFile("oneboard-logo.jpg")}
        style={{
          width: 140, height: 140, borderRadius: "50%", objectFit: "cover",
          opacity: logoOp, transform: `scale(${logoScale})`,
          boxShadow: `0 0 60px rgba(0,212,170,0.3)`,
        }}
      />
      <div style={{ fontFamily: HEADING, fontSize: 88, fontWeight: 700, letterSpacing: -3, opacity: titleOp, transform: `translateY(${titleY}px)` }}>
        <span style={{ color: COLORS.white }}>One</span>
        <span style={{ color: COLORS.accent }}>Board</span>
      </div>
      <div style={{ fontFamily: BODY, fontSize: 28, color: COLORS.muted, opacity: subOp }}>
        A Monopoly-style game where every property is a real OneChain protocol
      </div>
      <div style={{ fontFamily: HEADING, fontSize: 18, color: COLORS.accent, opacity: tagOp, letterSpacing: 4, textTransform: "uppercase", marginTop: 16 }}>
        OneHack 3.0 AI-GameFi 2026
      </div>
    </div>
  );
};
