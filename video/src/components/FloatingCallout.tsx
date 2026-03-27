import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { HEADING } from "../fonts";
import { COLORS } from "../constants";

export const FloatingCallout: React.FC<{
  text: string;
  subtext?: string;
  enterFrame: number;
  exitFrame: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, subtext, enterFrame, exitFrame, color = COLORS.accent, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prog = spring({ frame: frame - enterFrame, fps, config: { damping: 18, stiffness: 150 } });
  const fadeOut = interpolate(frame, [exitFrame - 20, exitFrame], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(prog, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }) * fadeOut;
  const scale = interpolate(prog, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(13,27,42,0.92)",
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: "14px 22px",
        maxWidth: 400,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}20`,
        zIndex: 10,
        ...style,
      }}
    >
      <div style={{ fontFamily: HEADING, fontSize: 22, fontWeight: 700, color }}>{text}</div>
      {subtext && <div style={{ fontSize: 15, color: COLORS.offWhite, marginTop: 4 }}>{subtext}</div>}
    </div>
  );
};
