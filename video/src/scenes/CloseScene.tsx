import { useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img } from "remotion";
import { COLORS } from "../constants";
import { HEADING, BODY, MONO } from "../fonts";

export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Phase 1: URL + try it (0-200)
  const p1 = interpolate(frame, [0, 15, 180, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Phase 2: Logo + links + attribution (200-end)
  const p2 = interpolate(frame, [200, 230], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Corner brackets
  const cornerOp = interpolate(frame, [220, 250], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const corner = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute" as const, width: 50, height: 50,
    opacity: cornerOp, borderColor: COLORS.accent, ...extra,
  });

  return (
    <div
      style={{
        width: "100%", height: "100%", position: "relative",
        background: `radial-gradient(ellipse at center, ${COLORS.accentDim} 0%, ${COLORS.bg} 65%)`,
      }}
    >
      {/* Phase 1: CTA */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 20, opacity: p1,
      }}>
        <div style={{ fontFamily: HEADING, fontSize: 44, fontWeight: 700, color: COLORS.accent }}>
          Play Now
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 28, color: COLORS.amber,
          background: COLORS.bgCard, padding: "14px 32px", borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
        }}>
          oneboard-mauve.vercel.app
        </div>
      </div>

      {/* Phase 2: Logo + links */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 20, opacity: p2,
      }}>
        <Img
          src={staticFile("oneboard-logo.jpg")}
          style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", boxShadow: `0 0 40px ${COLORS.accent}40` }}
        />
        <div style={{ fontFamily: HEADING, fontSize: 64, fontWeight: 700 }}>
          <span style={{ color: COLORS.white }}>One</span>
          <span style={{ color: COLORS.accent }}>Board</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: COLORS.muted }}>
          github.com/Leihyn/oneboard-game
        </div>
        <div style={{ fontFamily: HEADING, fontSize: 16, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginTop: 12 }}>
          Built for OneHack 3.0 AI-GameFi 2026
        </div>
        <div style={{ fontFamily: BODY, fontSize: 16, color: COLORS.muted, marginTop: 4 }}>
          By Faruq Onatola
        </div>
      </div>

      {/* Corner brackets */}
      <div style={corner({ top: 40, left: 40, borderTop: "3px solid", borderLeft: "3px solid" })} />
      <div style={corner({ top: 40, right: 40, borderTop: "3px solid", borderRight: "3px solid" })} />
      <div style={corner({ bottom: 40, left: 40, borderBottom: "3px solid", borderLeft: "3px solid" })} />
      <div style={corner({ bottom: 40, right: 40, borderBottom: "3px solid", borderRight: "3px solid" })} />
    </div>
  );
};
