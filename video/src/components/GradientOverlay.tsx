export const GradientOverlay: React.FC<{
  position?: "top" | "bottom" | "both";
  opacity?: number;
}> = ({ position = "bottom", opacity = 0.85 }) => (
  <>
    {(position === "top" || position === "both") && (
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "35%",
          background: `linear-gradient(180deg, rgba(13,27,42,${opacity}) 0%, transparent 100%)`,
          zIndex: 5, pointerEvents: "none",
        }}
      />
    )}
    {(position === "bottom" || position === "both") && (
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0, height: "35%",
          background: `linear-gradient(0deg, rgba(13,27,42,${opacity}) 0%, transparent 100%)`,
          zIndex: 5, pointerEvents: "none",
        }}
      />
    )}
  </>
);
