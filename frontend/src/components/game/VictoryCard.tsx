"use client";

import { useRef, useState } from "react";
import { GameState, BOARD_SPACES, CATEGORY_LABELS, PropertyCategory } from "@/lib/types";
import { calculateDefiIQ, ScoreBreakdown } from "./DefiIQScore";

interface VictoryCardProps {
  game: GameState;
}

function CardSVG({ game, score }: { game: GameState; score: ScoreBreakdown }) {
  const player = game.players[0];
  const categoriesStr = score.categoriesExplored.map((c) => CATEGORY_LABELS[c].name).join(" / ");
  const topProperties = player.propertiesOwned.slice(0, 3).map((idx) => BOARD_SPACES[idx].name);

  return (
    <svg width="600" height="340" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: 8 }}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0D1B2A" />
          <stop offset="100%" stopColor="#142231" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="25%" stopColor="#00D4AA" />
          <stop offset="50%" stopColor="#FFB800" />
          <stop offset="75%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
        <linearGradient id="scoreBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00D4AA" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="600" height="340" fill="url(#bg)" rx="8" />

      {/* Top accent stripe */}
      <rect width="600" height="5" fill="url(#accent)" />

      {/* Diamond pattern (subtle) */}
      <pattern id="diamonds" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M24 4L44 24L24 44L4 24Z" fill="none" stroke="#FF6B6B" strokeWidth="0.5" opacity="0.06" />
        <path d="M24 12L36 24L24 36L12 24Z" fill="none" stroke="#00D4AA" strokeWidth="0.5" opacity="0.04" />
      </pattern>
      <rect width="600" height="340" fill="url(#diamonds)" />

      {/* Left section - Title */}
      <text x="32" y="48" fill="#7A8A9E" fontSize="10" fontFamily="sans-serif" letterSpacing="3" fontWeight="600">ONEBOARD VICTORY</text>

      <text x="32" y="82" fill="#FFFFFF" fontSize="28" fontFamily="sans-serif" fontWeight="700" letterSpacing="-1">
        <tspan fill="#FFFFFF">One</tspan><tspan fill="#00D4AA">Board</tspan>
      </text>

      {/* DeFi IQ Title */}
      <text x="32" y="118" fill="#00D4AA" fontSize="22" fontFamily="sans-serif" fontWeight="700">{score.title}</text>
      <text x="32" y="140" fill="#7A8A9E" fontSize="12" fontFamily="sans-serif">{score.subtitle}</text>

      {/* Stats row */}
      <text x="32" y="178" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="2" fontWeight="600">STATS</text>

      {/* Properties */}
      <text x="32" y="200" fill="#00D4AA" fontSize="24" fontFamily="sans-serif" fontWeight="700">{score.propertiesOwned}</text>
      <text x="32" y="214" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="1">PROPERTIES</text>

      {/* Upgrades */}
      <text x="110" y="200" fill="#FFB800" fontSize="24" fontFamily="sans-serif" fontWeight="700">{score.upgradesMade}</text>
      <text x="110" y="214" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="1">UPGRADES</text>

      {/* Balance */}
      <text x="188" y="200" fill="#22C55E" fontSize="24" fontFamily="sans-serif" fontWeight="700">{player.balance.toLocaleString()}</text>
      <text x="188" y="214" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="1">OCT BALANCE</text>

      {/* Turns */}
      <text x="296" y="200" fill="#E8ECF1" fontSize="24" fontFamily="sans-serif" fontWeight="700">{game.turnNumber}</text>
      <text x="296" y="214" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="1">TURNS</text>

      {/* Protocols explored */}
      <text x="32" y="250" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="2" fontWeight="600">PROTOCOLS EXPLORED</text>
      <text x="32" y="268" fill="#E8ECF1" fontSize="13" fontFamily="sans-serif">{categoriesStr || "None"}</text>

      {/* Top properties */}
      {topProperties.length > 0 && (
        <>
          <text x="32" y="298" fill="#7A8A9E" fontSize="9" fontFamily="sans-serif" letterSpacing="2" fontWeight="600">TOP HOLDINGS</text>
          <text x="32" y="316" fill="#E8ECF1" fontSize="13" fontFamily="sans-serif">{topProperties.join(" / ")}</text>
        </>
      )}

      {/* Right section - Score circle */}
      <circle cx="500" cy="120" r="60" fill="url(#scoreBg)" stroke="#00D4AA" strokeWidth="2" />
      <circle cx="500" cy="120" r="60" fill="none" stroke="#1B2838" strokeWidth="8"
        strokeDasharray={`${score.totalScore * 3.77} 377`}
        strokeDashoffset="0"
        transform="rotate(-90 500 120)"
        strokeLinecap="round"
      />
      <circle cx="500" cy="120" r="60" fill="none" stroke="#00D4AA" strokeWidth="3"
        strokeDasharray={`${score.totalScore * 3.77} 377`}
        strokeDashoffset="0"
        transform="rotate(-90 500 120)"
        strokeLinecap="round"
      />
      <text x="500" y="110" textAnchor="middle" fill="#E8ECF1" fontSize="32" fontFamily="sans-serif" fontWeight="700">{score.totalScore}</text>
      <text x="500" y="128" textAnchor="middle" fill="#7A8A9E" fontSize="10" fontFamily="sans-serif" letterSpacing="2">DEFI IQ</text>
      <text x="500" y="148" textAnchor="middle" fill="#00D4AA" fontSize="14" fontFamily="sans-serif" fontWeight="700">Grade {score.grade}</text>

      {/* Bottom text */}
      <text x="500" y="250" textAnchor="middle" fill="#7A8A9E" fontSize="10" fontFamily="sans-serif" letterSpacing="1">Built on OneChain</text>
      <text x="500" y="268" textAnchor="middle" fill="#7A8A9E" fontSize="10" fontFamily="sans-serif" letterSpacing="1">Move Smart Contracts</text>

      {/* Bottom accent stripe */}
      <rect y="335" width="600" height="5" fill="url(#accent)" />
    </svg>
  );
}

export function VictoryCard({ game }: VictoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const score = calculateDefiIQ(game);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const svgElement = cardRef.current.querySelector("svg");
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      // Create canvas for PNG export
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 680;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1200, 680);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `oneboard-victory-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, "image/png");
      };
      img.src = url;
    } catch {
      setDownloading(false);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `I just dominated OneBoard with a DeFi IQ of ${score.totalScore}/100! 🎲\n\n` +
      `Title: ${score.title}\n` +
      `Properties: ${score.propertiesOwned} | Upgrades: ${score.upgradesMade}\n` +
      `Won in ${game.turnNumber} turns\n\n` +
      `Think you can beat my score? Play the DeFi board game on @OneChain 🔥\n\n` +
      `#OneBoard #OneChain #DeFi #OneHack`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[620px]">
      {/* Card preview */}
      <div ref={cardRef} className="w-full rounded-[8px] overflow-hidden shadow-[var(--shadow-elevated)] border border-[var(--border)]">
        <CardSVG game={game} score={score} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="btn px-6 py-2.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-[var(--r-sharp)] font-semibold hover:border-[var(--border-hover)] hover:bg-[var(--card-hover)] disabled:opacity-50"
          style={{ fontSize: "var(--text-sm)" }}
        >
          {downloading ? "Saving..." : "Save Card"}
        </button>
        <button
          onClick={shareOnTwitter}
          className="btn px-6 py-2.5 bg-[#1DA1F2] text-white rounded-[var(--r-sharp)] font-semibold hover:brightness-110"
          style={{ fontSize: "var(--text-sm)" }}
        >
          Share on X
        </button>
      </div>
    </div>
  );
}
