import { useCurrentFrame, useVideoConfig, spring } from "remotion";

export const FadeIn: React.FC<{
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, direction = "up", children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 30 } });
  const distance = 30;

  const transforms: Record<string, string> = {
    up: `translateY(${(1 - progress) * distance}px)`,
    down: `translateY(${(1 - progress) * -distance}px)`,
    left: `translateX(${(1 - progress) * distance}px)`,
    right: `translateX(${(1 - progress) * -distance}px)`,
    none: "",
  };

  return (
    <div style={{ opacity, transform: transforms[direction], ...style }}>
      {children}
    </div>
  );
};
