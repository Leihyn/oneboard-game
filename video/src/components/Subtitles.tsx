import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FPS } from "../constants";
import { BODY } from "../fonts";

interface Sub {
  startSec: number;
  endSec: number;
  text: string;
}

const SUBS: Sub[] = [
  { startSec: 0.5, endSec: 4.5, text: "DeFi is intimidating. The jargon, the risk, the complexity." },
  { startSec: 4.6, endSec: 8.5, text: "It keeps millions of users from ever going on-chain." },
  { startSec: 8.6, endSec: 12.0, text: "And blockchain games? Most of them feel like token farms" },
  { startSec: 12.1, endSec: 16.0, text: "with no real gameplay." },
  { startSec: 18.5, endSec: 22.0, text: "What if learning DeFi felt like a board game?" },
  { startSec: 22.1, endSec: 25.5, text: "Introducing OneBoard. A Monopoly-style game" },
  { startSec: 25.6, endSec: 29.0, text: "where every property is a real OneChain protocol." },
  { startSec: 30.5, endSec: 34.0, text: "Connect your OneWallet and start a game." },
  { startSec: 34.1, endSec: 39.5, text: "Every action, from creating the game to rolling dice, is a signed transaction on OneChain." },
  { startSec: 50.5, endSec: 54.0, text: "Roll dice to move around 16 spaces." },
  { startSec: 54.1, endSec: 58.5, text: "Buy real protocols like OneDEX and OCT Staking." },
  { startSec: 58.6, endSec: 62.0, text: "Each purchase mints a dynamic NFT." },
  { startSec: 62.1, endSec: 66.5, text: "Three AI opponents powered by Groq's Llama model" },
  { startSec: 66.6, endSec: 69.5, text: "trash talk you in real time, each with a unique personality and strategy." },
  { startSec: 80.5, endSec: 84.5, text: "Want to play with friends? Create a lobby, share the game ID," },
  { startSec: 84.6, endSec: 88.5, text: "and compete on-chain. Two to four players, fully decentralized." },
  { startSec: 92.5, endSec: 96.5, text: "Every board space teaches you something." },
  { startSec: 96.6, endSec: 100.5, text: "Buying OneDEX teaches you what a DEX is." },
  { startSec: 100.6, endSec: 104.5, text: "Getting rug pulled teaches you the risks. The gameplay is the education." },
  { startSec: 107.5, endSec: 111.5, text: "Five Move smart contracts handle all game logic on-chain." },
  { startSec: 111.6, endSec: 115.5, text: "Next.js frontend with OneWallet integration." },
  { startSec: 115.6, endSec: 119.0, text: "Groq for AI decisions and trash talk." },
  { startSec: 121.5, endSec: 125.0, text: "OneBoard. The DeFi board game on OneChain." },
  { startSec: 125.1, endSec: 129.0, text: "Try it now at oneboard-mauve.vercel.app" },
  { startSec: 129.1, endSec: 132.5, text: "Built for OneHack 3.0." },
];

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const timeSec = frame / FPS;

  const activeSub = SUBS.find((s) => timeSec >= s.startSec && timeSec <= s.endSec);
  if (!activeSub) return null;

  const fadeIn = interpolate(
    timeSec,
    [activeSub.startSec, activeSub.startSec + 0.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    timeSec,
    [activeSub.endSec - 0.2, activeSub.endSec],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 100,
        opacity: fadeIn * fadeOut,
      }}
    >
      <div
        style={{
          fontFamily: BODY,
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.white,
          textAlign: "center",
          maxWidth: 1000,
          padding: "10px 28px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.7)",
          textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          lineHeight: 1.4,
        }}
      >
        {activeSub.text}
      </div>
    </div>
  );
};
