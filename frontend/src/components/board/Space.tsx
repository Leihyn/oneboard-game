"use client";

import { useState, useEffect, useMemo } from "react";
import { Space as SpaceType, PlayerState, CATEGORY_LABELS, PropertyCategory } from "@/lib/types";
import { getProtocolMetrics, ProtocolMetrics } from "@/lib/protocolData";
import { Rocket, Zap, Banknote, Lock, TrendingDown, Gift, Vote, Gamepad2, Droplets, BarChart3, Landmark, type LucideIcon } from "lucide-react";

interface SpaceProps {
  space: SpaceType;
  ownerIndex?: number;
  level: number;
  playersHere: (PlayerState & { index: number })[];
  highlighted?: boolean;
}

const PLAYER_COLORS = ["var(--p0)", "var(--p1)", "var(--p2)", "var(--p3)"];
const PLAYER_LABELS = ["Y", "D", "W", "M"];

const CATEGORY_HEX: Record<PropertyCategory, string> = {
  yield_farm: "#22c55e",
  lp: "#3b82f6",
  dex: "#A855F7",
  lending: "#f97316",
  staking: "#06b6d4",
};

const SPECIAL_HEX: Record<string, string> = {
  start: "#22c55e",
  chance: "#FFB800",
  tax: "#EF4444",
  jail: "#EF4444",
  rug_pull: "#EF4444",
  airdrop: "#38bdf8",
  governance: "#6366f1",
};

const SPACE_IMAGES: Record<string, string> = {
  "Genesis Block": "/images/genesis.jpg",
  "OnePlay": "/images/oneplay.jpg",
  "OCT Airdrop": "/images/airdrop.jpg",
  "OneRWA": "/images/rwa.jpg",
  "OneDEX": "/images/dex.jpg",
  "Gas Tax": "/images/tax.jpg",
  "OCT Staking": "/images/staking.jpg",
  "OneDEX LP": "/images/lp.jpg",
  "MEV Jail": "/images/jail.jpg",
  "USDO Vault": "/images/vault.jpg",
  "Rug Pull": "/images/rugpull.jpg",
  "OneTransfer": "/images/transfer.jpg",
  "OnePredict": "/images/predict.jpg",
  "DAO Vote": "/images/vote.jpg",
  "OnePoker": "/images/onepoker.jpg",
  "OneNFT": "/images/nft.jpg",
};

const SPECIAL_ICONS: Record<string, LucideIcon> = {
  start: Rocket,
  chance: Zap,
  tax: Banknote,
  jail: Lock,
  rug_pull: TrendingDown,
  airdrop: Gift,
  governance: Vote,
};

const CATEGORY_ICONS: Record<PropertyCategory, LucideIcon> = {
  yield_farm: Gamepad2,
  lp: Droplets,
  dex: BarChart3,
  lending: Landmark,
  staking: Lock,
};

// Which edge of the board this space sits on
function getSpaceEdge(index: number): "top" | "right" | "bottom" | "left" {
  if (index >= 0 && index <= 5) return "top";
  if (index >= 6 && index <= 8) return "right";
  if (index >= 9 && index <= 13) return "bottom";
  return "left";
}

// Category strip CSS based on board edge (strip faces OUTWARD like real Monopoly)
function getCategoryStripStyle(edge: string, color: string): React.CSSProperties {
  const size = "4px";
  switch (edge) {
    case "top": return { borderTop: `${size} solid ${color}` };
    case "right": return { borderRight: `${size} solid ${color}` };
    case "bottom": return { borderBottom: `${size} solid ${color}` };
    case "left": return { borderLeft: `${size} solid ${color}` };
    default: return { borderTop: `${size} solid ${color}` };
  }
}

export function Space({ space, ownerIndex, level, playersHere, highlighted = false }: SpaceProps) {
  const isProperty = space.spaceType === "property";
  const [metrics, setMetrics] = useState<ProtocolMetrics | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isProperty) return;
    setMetrics(getProtocolMetrics(space.index));
    const interval = setInterval(() => setMetrics(getProtocolMetrics(space.index)), 8000);
    return () => clearInterval(interval);
  }, [space.index, isProperty]);

  const edge = getSpaceEdge(space.index);
  const accentColor = isProperty && space.category
    ? CATEGORY_HEX[space.category]
    : SPECIAL_HEX[space.spaceType] || "#00D4AA";

  const stripStyle = (isProperty && space.category)
    ? getCategoryStripStyle(edge, accentColor)
    : getCategoryStripStyle(edge, accentColor);

  const levelLabel = isProperty && space.category && level > 0
    ? CATEGORY_LABELS[space.category].levels[level]
    : null;

  const IconComponent = isProperty && space.category
    ? CATEGORY_ICONS[space.category]
    : SPECIAL_ICONS[space.spaceType] || null;

  const ownerColor = ownerIndex !== undefined ? PLAYER_COLORS[ownerIndex] : null;
  const imgSrc = SPACE_IMAGES[space.name];

  // Build background style
  const bgStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = {
      ...stripStyle,
      position: "relative" as const,
    };

    if (ownerColor) {
      base.boxShadow = `inset 0 0 0 1.5px ${ownerColor}, 0 0 12px color-mix(in srgb, ${ownerColor} 30%, transparent)`;
    }

    if (highlighted) {
      base.boxShadow = `0 0 20px ${accentColor}, inset 0 0 12px color-mix(in srgb, ${accentColor} 15%, transparent)`;
    }

    return base;
  }, [stripStyle, ownerColor, highlighted, accentColor]);

  return (
    <div
      className={`space-${space.index} group relative bg-[var(--card)] border border-[var(--border)] rounded-[6px] flex flex-col items-center justify-center gap-0.5 min-h-[80px] md:min-h-[120px] text-center transition-all duration-200 ease-[var(--ease-out)] cursor-default overflow-hidden ${highlighted ? "space-highlight" : ""}`}
      style={bgStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Protocol image background */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          style={{ opacity: hovered ? 0.25 : 0.15 }}
          loading="lazy"
        />
      )}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `linear-gradient(180deg, rgba(13,27,42,0.3) 0%, rgba(13,27,42,0.7) 60%, rgba(13,27,42,0.85) 100%)`,
      }} />

      {/* Owner indicator — top-left colored dot with glow */}
      {ownerIndex !== undefined && (
        <div
          className="absolute top-1.5 left-1.5 z-10 w-3 h-3 rounded-full border border-[var(--navy)]"
          style={{
            backgroundColor: PLAYER_COLORS[ownerIndex],
            boxShadow: `0 0 8px ${PLAYER_COLORS[ownerIndex]}`,
          }}
        />
      )}

      {/* Upgrade pips — top-right */}
      {level > 0 && (
        <div className="absolute top-1 right-1.5 z-10 flex gap-[3px]">
          {Array.from({ length: level }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-sm rotate-45"
              style={{
                backgroundColor: "var(--amber)",
                boxShadow: "0 0 6px var(--amber)",
              }}
            />
          ))}
        </div>
      )}

      {/* Content — relative z for above overlay */}
      <div className="relative z-10 flex flex-col items-center gap-0.5 px-1 py-1">
        {/* Icon */}
        {IconComponent && <IconComponent size={20} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ color: accentColor }} />}

        {/* Name */}
        <div
          className="font-bold text-[var(--white)] leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(9px, 1.2vw, 13px)" }}
        >
          {space.name}
        </div>

        {/* Price */}
        {isProperty && (
          <div
            className="font-semibold tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
            style={{ fontSize: "clamp(8px, 1vw, 11px)", color: accentColor }}
          >
            {space.basePrice} OCT
          </div>
        )}

        {/* Level label */}
        {levelLabel && (
          <div
            className="font-bold uppercase tracking-wider"
            style={{ fontSize: "8px", color: "var(--amber)", textShadow: "0 0 8px var(--amber)" }}
          >
            {levelLabel}
          </div>
        )}

        {/* Live metrics — desktop only */}
        {isProperty && metrics && (
          <div className="hidden md:flex items-center gap-1 mt-0.5" style={{ fontSize: "8px" }}>
            <span className="text-[var(--text-dim)] tabular-nums">{metrics.tvl}</span>
            <span className="tabular-nums" style={{ color: metrics.change24h >= 0 ? "var(--green)" : "var(--red)" }}>
              {metrics.change24h >= 0 ? "+" : ""}{metrics.change24h}%
            </span>
          </div>
        )}

        {/* Special space effects */}
        {space.spaceType === "tax" && <div className="text-[var(--red)] font-bold tabular-nums" style={{ fontSize: "10px" }}>-200 OCT</div>}
        {space.spaceType === "chance" && <div className="text-[var(--amber)] font-bold tabular-nums" style={{ fontSize: "10px" }}>+300 OCT</div>}
        {space.spaceType === "airdrop" && <div className="font-bold tabular-nums" style={{ fontSize: "10px", color: "#38bdf8" }}>+400 OCT</div>}
        {space.spaceType === "rug_pull" && <div className="text-[var(--red)] font-bold tabular-nums" style={{ fontSize: "10px" }}>-50%</div>}
        {space.spaceType === "governance" && <div className="font-bold tabular-nums" style={{ fontSize: "10px", color: "#6366f1" }}>+250 OCT</div>}
        {space.spaceType === "jail" && <div className="text-[var(--red)] font-bold" style={{ fontSize: "10px" }}>2 turns</div>}
        {space.spaceType === "start" && <div className="text-[var(--green)] font-bold tabular-nums" style={{ fontSize: "10px" }}>+500 OCT</div>}
      </div>

      {/* Player tokens — pinned to bottom */}
      {playersHere.length > 0 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex gap-0.5">
          {playersHere.map((p) => (
            <div
              key={p.index}
              className="w-5 h-5 rounded-full border-[1.5px] border-[rgba(13,27,42,0.8)] flex items-center justify-center font-bold"
              style={{
                backgroundColor: PLAYER_COLORS[p.index],
                boxShadow: p.index === 0
                  ? "0 0 8px var(--amber), 0 0 16px rgba(255,184,0,0.3)"
                  : "0 2px 6px rgba(0,0,0,0.5)",
                fontSize: "9px",
                color: "var(--navy)",
                animation: p.index === 0 ? "tokenPulse 2s ease-in-out infinite" : undefined,
              }}
            >
              {PLAYER_LABELS[p.index]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
