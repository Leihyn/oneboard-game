// Synced with OneBoard's CSS design tokens
export const COLORS = {
  bg: "#0D1B2A",
  bgCard: "#131F30",
  surface: "#1A2940",
  accent: "#00D4AA",
  accentDim: "#0a3d32",
  coral: "#FF6B6B",
  amber: "#FFB800",
  purple: "#A855F7",
  white: "#FFFFFF",
  offWhite: "#C8D6E5",
  muted: "#8BA3BF",
  border: "rgba(255,255,255,0.08)",
  red: "#EF4444",
  green: "#22c55e",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Scene durations matched to voiceover segment lengths + 1s buffer
export const SCENES = {
  hook: 18,            // VO: 16.5s
  reveal: 12,          // VO: 10.8s
  recConnect: 20,      // VO: 9.6s
  recGameplay: 30,     // VO: 19.2s
  recPvp: 12,          // VO: 11.1s
  features: 15,        // VO: 12.9s
  architecture: 14,    // VO: 12.2s
  close: 13,           // VO: 11.6s
};

export const TOTAL_SECONDS = Object.values(SCENES).reduce((a, b) => a + b, 0);
export const TOTAL_FRAMES = TOTAL_SECONDS * FPS;
// Total: 134s = 2:14
