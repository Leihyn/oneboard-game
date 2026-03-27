import { Series, AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FPS, SCENES, TOTAL_FRAMES } from "./constants";
import { BODY, HEADING } from "./fonts";
import { HookScene } from "./scenes/HookScene";
import { RevealScene } from "./scenes/RevealScene";
import { RecConnectScene } from "./scenes/RecConnectScene";
import { RecGameplayScene } from "./scenes/RecGameplayScene";
import { RecPvpScene } from "./scenes/RecPvpScene";
import { DemoFeaturesScene } from "./scenes/DemoFeaturesScene";
import { ArchitectureScene } from "./scenes/ArchitectureScene";
import { CloseScene } from "./scenes/CloseScene";
import { Subtitles } from "./components/Subtitles";

// Timeline:
//   0:00 – 0:10  Hook (problem statement)
//   0:10 – 0:18  Product Reveal (logo + name)
//   0:18 – 0:38  Recording: Connect wallet + start game
//   0:38 – 1:08  Recording: Gameplay (dice, buy, AI)
//   1:08 – 1:20  Recording: PvP lobby
//   1:20 – 1:35  Features (protocol images)
//   1:35 – 1:45  Architecture (two-column)
//   1:45 – 1:57  Close (CTA + logo)

const S = (seconds: number) => seconds * FPS;

export const OneBoardDemo: React.FC = () => {
  const frame = useCurrentFrame();
  // Hide logo during reveal scene (frames 300-540) and close scene (last 360 frames)
  const revealStart = SCENES.hook * FPS;
  const revealEnd = (SCENES.hook + SCENES.reveal) * FPS;
  const closeStart = TOTAL_FRAMES - SCENES.close * FPS;
  const inReveal = frame >= revealStart && frame < revealEnd;
  const inClose = frame >= closeStart;
  const logoOp = (inReveal || inClose) ? 0 : interpolate(frame, [0, 15], [0, 0.9], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
  <AbsoluteFill style={{ background: COLORS.bg, fontFamily: BODY, color: COLORS.white }}>
    {/* Persistent logo — top left, hidden during reveal + close */}
    <div style={{
      position: "absolute", top: 24, left: 28, zIndex: 50,
      display: "flex", alignItems: "center", gap: 10,
      opacity: logoOp,
    }}>
      <Img
        src={staticFile("oneboard-logo.jpg")}
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
      />
      <span style={{ fontFamily: HEADING, fontSize: 20, fontWeight: 700 }}>
        <span style={{ color: COLORS.white }}>One</span>
        <span style={{ color: COLORS.accent }}>Board</span>
      </span>
    </div>

    <Series>
      <Series.Sequence durationInFrames={S(SCENES.hook)}>
        <HookScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.reveal)}>
        <RevealScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.recConnect)}>
        <RecConnectScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.recGameplay)}>
        <RecGameplayScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.recPvp)}>
        <RecPvpScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.features)}>
        <DemoFeaturesScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.architecture)}>
        <ArchitectureScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S(SCENES.close)}>
        <CloseScene />
      </Series.Sequence>
    </Series>

    {/* Subtitles overlay — persists across all scenes */}
    <Subtitles />
  </AbsoluteFill>
  );
};
