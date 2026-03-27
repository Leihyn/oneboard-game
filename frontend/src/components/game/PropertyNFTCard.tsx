"use client";

import { Space, CATEGORY_LABELS, PropertyCategory } from "@/lib/types";

interface PropertyNFTCardProps {
  space: Space;
  level: number;
  ownerName: string;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<PropertyCategory, string> = {
  yield_farm: "var(--cat-yield-farm)",
  lp: "var(--cat-lp)",
  dex: "var(--cat-dex)",
  lending: "var(--cat-lending)",
  staking: "var(--cat-staking)",
};

const RENT_MULTIPLIERS = [1, 2.5, 6];

export function PropertyNFTCard({ space, level, ownerName, compact = false }: PropertyNFTCardProps) {
  if (!space.category) return null;

  const accent = CATEGORY_COLORS[space.category];
  const categoryInfo = CATEGORY_LABELS[space.category];
  const tierName = categoryInfo.levels[level];
  const currentRent = level === 0 ? space.baseRent : Math.floor(space.baseRent * RENT_MULTIPLIERS[level]);

  if (compact) {
    return (
      <div
        className="bg-[var(--surface)] rounded-[var(--r-sharp)] border border-[var(--border)] p-2 flex items-center gap-2 transition-[border-color] duration-150 ease-[var(--ease-out)] hover:border-[var(--border-hover)]"
        style={{ borderTopColor: accent, borderTopWidth: 2 }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[var(--text)] truncate" style={{ fontSize: "var(--text-xs)" }}>{space.name}</div>
          <div className="font-semibold" style={{ color: accent, fontSize: "var(--text-xs)" }}>{tierName}</div>
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i <= level ? accent : "var(--border)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] overflow-hidden transition-[border-color] duration-150 ease-[var(--ease-out)] hover:border-[var(--border-hover)]">
      {/* Category color header stripe */}
      <div className="h-1" style={{ backgroundColor: accent }} />

      {/* Header */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="uppercase tracking-[0.5px] font-semibold" style={{ color: accent, fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>
              {categoryInfo.name}
            </div>
            <div className="font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>{space.name}</div>
          </div>
          <span className="uppercase tracking-[1px] px-1.5 py-0.5 rounded-full border font-semibold"
            style={{ color: accent, borderColor: accent, background: `${accent}15`, fontSize: "var(--text-xs)" }}
          >
            NFT
          </span>
        </div>
        <div className="text-[var(--text-dim)] mt-0.5" style={{ fontSize: "var(--text-xs)" }}>Owned by {ownerName}</div>
      </div>

      {/* Tier progression */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[var(--text-dim)] uppercase tracking-[0.5px]" style={{ fontSize: "var(--text-xs)" }}>Tier</span>
          <span className="font-semibold" style={{ color: accent, fontSize: "var(--text-xs)" }}>{tierName}</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-[var(--surface)]">
              {i <= level && <div className="h-full rounded-full" style={{ backgroundColor: accent }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-3 py-2 border-t border-[var(--border)] grid grid-cols-2 gap-2">
        <div>
          <div className="text-[var(--text-dim)] uppercase" style={{ fontSize: "var(--text-xs)" }}>Value</div>
          <div className="font-semibold text-[var(--text)] tabular-nums" style={{ fontSize: "var(--text-xs)" }}>{space.basePrice} OCT</div>
        </div>
        <div>
          <div className="text-[var(--text-dim)] uppercase" style={{ fontSize: "var(--text-xs)" }}>Rent</div>
          <div className="font-semibold tabular-nums" style={{ color: accent, fontSize: "var(--text-xs)" }}>{currentRent} OCT</div>
        </div>
        <div>
          <div className="text-[var(--text-dim)] uppercase" style={{ fontSize: "var(--text-xs)" }}>Multiplier</div>
          <div className="font-semibold text-[var(--amber)] tabular-nums" style={{ fontSize: "var(--text-xs)" }}>{RENT_MULTIPLIERS[level]}x</div>
        </div>
        <div>
          <div className="text-[var(--text-dim)] uppercase" style={{ fontSize: "var(--text-xs)" }}>Level</div>
          <div className="font-semibold text-[var(--text)]" style={{ fontSize: "var(--text-xs)" }}>{level}/2</div>
        </div>
      </div>
    </div>
  );
}
