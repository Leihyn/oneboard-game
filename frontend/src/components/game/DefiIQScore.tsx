"use client";

import { GameState, BOARD_SPACES, PropertyCategory, CATEGORY_LABELS } from "@/lib/types";
import { Gamepad2, Droplets, BarChart3, Landmark, Lock, type LucideIcon } from "lucide-react";

interface DefiIQProps {
  game: GameState;
}

const CATEGORY_ICONS: Record<PropertyCategory, LucideIcon> = {
  yield_farm: Gamepad2,
  lp: Droplets,
  dex: BarChart3,
  lending: Landmark,
  staking: Lock,
};

const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  yield_farm: "var(--cat-yield-farm)",
  lp: "var(--cat-lp)",
  dex: "var(--cat-dex)",
  lending: "var(--cat-lending)",
  staking: "var(--cat-staking)",
};

interface ScoreBreakdown {
  categoriesExplored: PropertyCategory[];
  totalCategories: number;
  propertiesOwned: number;
  upgradesMade: number;
  finalBalance: number;
  totalScore: number;
  title: string;
  subtitle: string;
  grade: string;
}

function calculateDefiIQ(game: GameState): ScoreBreakdown {
  const player = game.players[0];
  const allCategories: PropertyCategory[] = ["yield_farm", "lp", "dex", "lending", "staking"];

  // Categories explored (bought at least one property from)
  const categoriesExplored = new Set<PropertyCategory>();
  for (const propIdx of player.propertiesOwned) {
    const space = BOARD_SPACES[propIdx];
    if (space.category) categoriesExplored.add(space.category);
  }

  // Upgrades made
  let upgradesMade = 0;
  for (const propIdx of player.propertiesOwned) {
    const level = game.propertyLevels.get(propIdx) || 0;
    upgradesMade += level;
  }

  // Score calculation
  const categoryScore = categoriesExplored.size * 20; // 0-100
  const propertyScore = Math.min(player.propertiesOwned.length * 8, 40); // 0-40
  const upgradeScore = Math.min(upgradesMade * 10, 30); // 0-30
  const balanceScore = player.balance >= 5000 ? 20 : player.balance >= 2000 ? 10 : 0; // 0-20
  const survivalScore = 10; // You won, so you survived

  const totalScore = Math.min(categoryScore + propertyScore + upgradeScore + balanceScore + survivalScore, 100);

  // Determine title based on strategy
  let title: string;
  let subtitle: string;

  if (categoriesExplored.size >= 4) {
    title = "DeFi Generalist";
    subtitle = "You explored the entire OneChain ecosystem";
  } else if (categoriesExplored.size === 1) {
    const cat = [...categoriesExplored][0];
    const catName = CATEGORY_LABELS[cat].name;
    title = `${catName} Maximalist`;
    subtitle = `All-in on ${catName} — bold strategy`;
  } else if (upgradesMade >= 4) {
    title = "Protocol Builder";
    subtitle = "You didn't just buy — you built empires";
  } else if (player.balance >= 8000) {
    title = "Diamond Hands";
    subtitle = "Massive treasury, patient plays";
  } else if (player.propertiesOwned.length >= 6) {
    title = "Property Mogul";
    subtitle = "You own half the chain";
  } else if (categoriesExplored.size >= 3) {
    title = "DeFi Explorer";
    subtitle = "Diversified across multiple protocols";
  } else {
    title = "DeFi Apprentice";
    subtitle = "Every degen starts somewhere";
  }

  // Letter grade
  let grade: string;
  if (totalScore >= 90) grade = "S";
  else if (totalScore >= 80) grade = "A";
  else if (totalScore >= 65) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else grade = "D";

  return {
    categoriesExplored: [...categoriesExplored],
    totalCategories: allCategories.length,
    propertiesOwned: player.propertiesOwned.length,
    upgradesMade,
    finalBalance: player.balance,
    totalScore,
    title,
    subtitle,
    grade,
  };
}

export function DefiIQScore({ game }: DefiIQProps) {
  const score = calculateDefiIQ(game);
  const allCategories: PropertyCategory[] = ["yield_farm", "lp", "dex", "lending", "staking"];

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6 w-full max-w-md shadow-[var(--shadow-elevated)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[var(--text-dim)] uppercase tracking-[2px] mb-1" style={{ fontFamily: "var(--font-heading)", fontSize: "9px" }}>
            DeFi IQ Score
          </div>
          <div className="font-bold text-[var(--teal)]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>
            {score.title}
          </div>
          <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>
            {score.subtitle}
          </div>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-bold"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-xl)",
            background: `conic-gradient(var(--teal) ${score.totalScore * 3.6}deg, var(--surface) 0deg)`,
            color: "var(--text)",
          }}
        >
          <div className="w-11 h-11 rounded-full bg-[var(--card)] flex items-center justify-center">
            {score.grade}
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-[var(--text-dim)] tabular-nums" style={{ fontSize: "var(--text-xs)" }}>Score</span>
          <span className="text-[var(--teal)] font-bold tabular-nums" style={{ fontSize: "var(--text-sm)" }}>{score.totalScore}/100</span>
        </div>
        <div className="h-2 bg-[var(--surface)] rounded-[var(--r-pill)] overflow-hidden">
          <div
            className="h-full rounded-[var(--r-pill)] transition-all duration-1000"
            style={{
              width: `${score.totalScore}%`,
              background: `linear-gradient(90deg, var(--teal), ${score.totalScore >= 70 ? "var(--green)" : "var(--amber)"})`,
            }}
          />
        </div>
      </div>

      {/* Categories explored */}
      <div className="mb-4">
        <div className="text-[var(--text-dim)] uppercase tracking-[1px] mb-2" style={{ fontFamily: "var(--font-heading)", fontSize: "9px" }}>
          Protocols Explored ({score.categoriesExplored.length}/{score.totalCategories})
        </div>
        <div className="flex gap-2">
          {allCategories.map((cat) => {
            const explored = score.categoriesExplored.includes(cat);
            return (
              <div
                key={cat}
                className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-[var(--r-sharp)] transition-all"
                style={{
                  background: explored ? `color-mix(in srgb, ${CATEGORY_COLORS[cat]} 15%, transparent)` : "var(--surface)",
                  border: `1px solid ${explored ? CATEGORY_COLORS[cat] : "var(--border)"}`,
                  opacity: explored ? 1 : 0.4,
                }}
              >
                {(() => { const Icon = CATEGORY_ICONS[cat]; return <Icon size={16} style={{ color: explored ? CATEGORY_COLORS[cat] : "var(--text-dim)" }} />; })()}
                <span style={{ fontSize: "9px", color: explored ? CATEGORY_COLORS[cat] : "var(--text-dim)" }}>
                  {CATEGORY_LABELS[cat].name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Properties", value: score.propertiesOwned.toString(), color: "var(--teal)" },
          { label: "Upgrades", value: score.upgradesMade.toString(), color: "var(--amber)" },
          { label: "Treasury", value: `${score.finalBalance.toLocaleString()}`, color: "var(--green)" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-bold tabular-nums" style={{ fontSize: "var(--text-lg)", color: stat.color }}>{stat.value}</div>
            <div className="text-[var(--text-dim)] uppercase tracking-[1px]" style={{ fontSize: "9px" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { calculateDefiIQ };
export type { ScoreBreakdown };
