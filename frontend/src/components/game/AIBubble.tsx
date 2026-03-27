"use client";

import { useEffect, useState } from "react";
import { useGame, GameLog } from "@/providers/GameProvider";
import { AI_PERSONALITIES, AIPersonality } from "@/lib/types";

const BUBBLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  degen: { bg: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.3)", text: "var(--coral)" },
  whale: { bg: "rgba(0,212,170,0.12)", border: "rgba(0,212,170,0.3)", text: "var(--teal)" },
  mev_bot: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", text: "var(--purple)" },
};

function getPersonalityFromName(name: string): string | null {
  if (name === "Degen") return "degen";
  if (name === "Whale") return "whale";
  if (name === "MEV Bot") return "mev_bot";
  return null;
}

export function AIBubble() {
  const { logs } = useGame();
  const [bubble, setBubble] = useState<GameLog | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Find the latest trash talk message
    const trashTalks = logs.filter((l) => l.type === "trash_talk");
    const latest = trashTalks[trashTalks.length - 1];

    if (latest && latest !== bubble) {
      setBubble(latest);
      setVisible(true);
      // Auto-hide after 6 seconds
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [logs, bubble]);

  if (!bubble || !visible) return null;

  const personality = getPersonalityFromName(bubble.playerName);
  if (!personality) return null;

  const colors = BUBBLE_COLORS[personality];
  const ai = AI_PERSONALITIES[personality as AIPersonality];

  return (
    <div
      className="w-full max-w-[280px]"
      style={{ animation: "bubbleIn 0.4s var(--ease-out)" }}
    >
      <div
        className="relative px-3 py-2.5 rounded-[8px]"
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {(() => { const Icon = ai.icon; return <Icon size={14} style={{ color: colors.text }} />; })()}
          <span
            className="font-semibold uppercase tracking-[1px]"
            style={{ fontFamily: "var(--font-heading)", fontSize: "10px", color: colors.text }}
          >
            {ai.name}
          </span>
        </div>
        {/* Message */}
        <div
          className="leading-snug"
          style={{
            fontSize: "var(--text-sm)",
            color: colors.text,
            fontStyle: "italic",
            fontFamily: personality === "whale" ? "Georgia, serif" : personality === "mev_bot" ? "'Courier New', monospace" : "inherit",
          }}
        >
          &ldquo;{bubble.message}&rdquo;
        </div>
        {/* Triangle pointer */}
        <div
          className="absolute -bottom-[6px] left-6 w-3 h-3 rotate-45"
          style={{ background: colors.bg, borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}
        />
      </div>
    </div>
  );
}
