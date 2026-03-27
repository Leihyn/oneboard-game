import { useCurrentFrame, useVideoConfig, spring, staticFile, Img, AbsoluteFill } from "remotion";
import { COLORS } from "../constants";
import { HEADING, BODY } from "../fonts";

const FEATURES = [
  { title: "16-Space Board", desc: "Real OneChain protocols as properties", color: COLORS.accent, img: "genesis.jpg" },
  { title: "Dynamic NFTs", desc: "3 upgrade tiers. NFTs evolve as you play", color: COLORS.amber, img: "nft.jpg" },
  { title: "Rug Pulls & Jail", desc: "DeFi risks made tangible through gameplay", color: COLORS.coral, img: "rugpull.jpg" },
  { title: "DAO Governance", desc: "Vote spaces, airdrop bonuses, gas taxes", color: COLORS.purple, img: "vote.jpg" },
];

export const DemoFeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps, from: 0, to: 1, config: { damping: 30 } });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, display: "flex", flexDirection: "column", padding: 60 }}>
      <div style={{ fontFamily: HEADING, fontSize: 48, fontWeight: 700, color: COLORS.white, textAlign: "center", opacity: titleOp, marginBottom: 30, flexShrink: 0 }}>
        Education Through Gameplay
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        {FEATURES.map((feat, i) => {
          const delay = 20 + i * 25;
          const opacity = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 25 } });
          const scale = spring({ frame: frame - delay, fps, from: 0.93, to: 1, config: { damping: 20 } });

          return (
            <div
              key={feat.title}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                opacity,
                transform: `scale(${scale})`,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {/* Background image — absolute fill */}
              <Img
                src={staticFile(feat.img)}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
              />
              {/* Dark overlay + text */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(135deg, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.5) 100%)`,
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "36px 40px",
              }}>
                <div style={{ width: 40, height: 3, background: feat.color, borderRadius: 2, marginBottom: 16 }} />
                <div style={{ fontFamily: HEADING, fontSize: 32, fontWeight: 700, color: feat.color }}>
                  {feat.title}
                </div>
                <div style={{ fontFamily: BODY, fontSize: 20, color: COLORS.offWhite, marginTop: 10, lineHeight: 1.5 }}>
                  {feat.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
