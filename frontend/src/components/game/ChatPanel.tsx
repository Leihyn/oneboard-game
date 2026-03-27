"use client";

import { useEffect, useRef } from "react";
import { useGame, GameLog } from "@/providers/GameProvider";
import { AI_PERSONALITIES, AIPersonality } from "@/lib/types";
import { Gamepad2 } from "lucide-react";

const PERSONALITY_STYLES: Record<string, { bg: string; border: string; font: string }> = {
  degen: {
    bg: "rgba(255,107,107,0.08)",
    border: "var(--coral)",
    font: "font-semibold italic",
  },
  whale: {
    bg: "rgba(0,212,170,0.08)",
    border: "var(--teal)",
    font: "font-normal",
  },
  mev_bot: {
    bg: "rgba(168,85,247,0.08)",
    border: "var(--purple)",
    font: "font-normal font-mono",
  },
};

const PERSONALITY_COLORS: Record<string, string> = {
  degen: "var(--coral)",
  whale: "var(--teal)",
  mev_bot: "var(--purple)",
};

function getPersonalityKey(playerName: string): string | null {
  if (playerName === "Degen") return "degen";
  if (playerName === "Whale") return "whale";
  if (playerName === "MEV Bot") return "mev_bot";
  return null;
}

// System-style log types rendered as centered dividers
const SYSTEM_TYPES = new Set(["roll", "tax", "chance", "jail", "system", "rug_pull", "airdrop", "governance", "jail_bail"]);

function ChatMessage({ log }: { log: GameLog }) {
  const personalityKey = getPersonalityKey(log.playerName);
  const isTrashTalk = log.type === "trash_talk";
  const isSystem = SYSTEM_TYPES.has(log.type) && !isTrashTalk;
  const isPlayerAction = !isSystem && !isTrashTalk && !personalityKey;

  // System events: centered divider
  if (isSystem) {
    return (
      <div className="flex items-center gap-3 py-1.5 px-2">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[var(--text-dim)] whitespace-nowrap flex-shrink-0" style={{ fontSize: "10px" }}>
          {log.playerName !== "System" && (
            <span className="font-semibold text-[var(--text)]" style={{ fontSize: "10px" }}>{log.playerName}</span>
          )}
          {log.playerName !== "System" ? " " : ""}
          {log.message}
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
    );
  }

  // AI trash talk or AI action
  if (personalityKey && PERSONALITY_STYLES[personalityKey]) {
    const style = PERSONALITY_STYLES[personalityKey];
    const personality = AI_PERSONALITIES[personalityKey as AIPersonality];
    const color = PERSONALITY_COLORS[personalityKey];

    return (
      <div
        className="mx-3 my-1 px-3 py-2 rounded-[var(--r-sharp)]"
        style={{
          background: style.bg,
          borderLeft: `3px solid ${style.border}`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          {(() => { const Icon = personality.icon; return <Icon size={14} style={{ color }} />; })()}
          <span className="font-semibold uppercase tracking-[1px]" style={{ fontSize: "11px", color, fontFamily: "var(--font-heading)" }}>
            {personality.name}
          </span>
          <span className="text-[var(--text-dim)] ml-auto tabular-nums" style={{ fontSize: "9px" }}>
            T{log.turn}
          </span>
        </div>
        <div
          className={`${style.font} leading-snug`}
          style={{
            fontSize: "var(--text-sm)",
            color: isTrashTalk ? color : "var(--text)",
            fontFamily: personalityKey === "whale" ? "Georgia, serif" : personalityKey === "mev_bot" ? "'Courier New', monospace" : "inherit",
          }}
        >
          {isTrashTalk ? `"${log.message}"` : log.message}
        </div>
      </div>
    );
  }

  // Player (You) actions
  if (log.playerName === "You" || isPlayerAction) {
    return (
      <div
        className="mx-3 my-1 px-3 py-2 rounded-[var(--r-sharp)]"
        style={{
          background: "rgba(0,212,170,0.08)",
          borderLeft: "3px solid var(--teal)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 size={14} style={{ color: "var(--teal)" }} />
          <span className="font-semibold uppercase tracking-[1px]" style={{ fontSize: "11px", color: "var(--teal)", fontFamily: "var(--font-heading)" }}>
            {log.playerName}
          </span>
          <span className="text-[var(--text-dim)] ml-auto tabular-nums" style={{ fontSize: "9px" }}>
            T{log.turn}
          </span>
        </div>
        <div className="leading-snug" style={{ fontSize: "var(--text-sm)", color: "var(--text)" }}>
          {log.message}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="mx-3 my-1 px-3 py-2 rounded-[var(--r-sharp)]" style={{ background: "rgba(255,255,255,0.03)", borderLeft: "3px solid var(--text-dim)" }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold" style={{ fontSize: "11px", color: "var(--text)" }}>{log.playerName}</span>
        <span className="text-[var(--text-dim)] ml-auto tabular-nums" style={{ fontSize: "9px" }}>T{log.turn}</span>
      </div>
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text)" }}>{log.message}</div>
    </div>
  );
}

export function ChatPanel() {
  const { logs, game, aiProcessing } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activePlayers = game.players.filter((p) => !p.isBankrupt);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="chat-panel flex flex-col h-full bg-[var(--card)] border border-[var(--border)] rounded-[6px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[rgba(13,27,42,0.5)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
          <span className="font-semibold uppercase tracking-[2px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>
            Live Game Feed
          </span>
        </div>
        <span className="text-[var(--text-dim)]" style={{ fontSize: "10px" }}>
          {activePlayers.length} players
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2 min-h-0">
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
            Waiting for first move...
          </div>
        )}
        {logs.map((log) => (
          <ChatMessage key={log.id} log={log} />
        ))}
      </div>

      {/* Bottom status bar */}
      <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[rgba(13,27,42,0.5)]">
        <div className="flex items-center gap-2" style={{ fontSize: "var(--text-xs)" }}>
          {aiProcessing ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
              <span className="text-[var(--text-dim)]">
                AI is thinking
                <span className="chat-dots">...</span>
              </span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
              <span className="text-[var(--text-dim)]">
                Turn {game.turnNumber} &middot; {game.players[game.currentTurn]?.isAi ? (
                  game.players[game.currentTurn]?.aiPersonality === "degen" ? "Degen" :
                  game.players[game.currentTurn]?.aiPersonality === "whale" ? "Whale" : "MEV Bot"
                ) : "Your"} turn
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
