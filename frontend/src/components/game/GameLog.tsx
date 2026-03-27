"use client";

import { useGame, GameLog as GameLogType } from "@/providers/GameProvider";
import { useEffect, useRef } from "react";

const LOG_COLORS: Record<GameLogType["type"], string> = {
  roll: "text-[var(--text-dim)]",
  buy: "text-[var(--teal)]",
  rent: "text-[var(--amber)]",
  tax: "text-[var(--red)]",
  chance: "text-[var(--amber)]",
  jail: "text-[var(--red)]",
  upgrade: "text-[var(--cyan)]",
  bankrupt: "text-[var(--red)] font-bold",
  system: "text-[var(--text-dim)]",
  trash_talk: "text-[var(--pink)] italic",
  auction: "text-[var(--amber)]",
  rug_pull: "text-[var(--red)]",
  airdrop: "text-[var(--sky)]",
  governance: "text-[var(--indigo)]",
  mortgage: "text-[var(--amber)]",
  jail_bail: "text-[var(--teal)]",
};

const LOG_BORDER_CLASS: Record<GameLogType["type"], string> = {
  roll: "log-border-roll",
  buy: "log-border-buy",
  rent: "log-border-rent",
  tax: "log-border-tax",
  chance: "log-border-chance",
  jail: "log-border-jail",
  upgrade: "log-border-upgrade",
  bankrupt: "log-border-bankrupt",
  system: "log-border-system",
  trash_talk: "log-border-trash_talk",
  auction: "log-border-auction",
  rug_pull: "log-border-rug_pull",
  airdrop: "log-border-airdrop",
  governance: "log-border-governance",
  mortgage: "log-border-mortgage",
  jail_bail: "log-border-jail_bail",
};

const PLAYER_NAME_COLORS = ["text-[var(--p0)]", "text-[var(--p1)]", "text-[var(--p2)]", "text-[var(--p3)]"];

export function GameLogView({ logs }: { logs: GameLogType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs.length]);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="px-3 py-2.5 border-b border-[var(--border)]">
        <h3 className="font-semibold uppercase tracking-[1px] text-[var(--text-dim)]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>
          Transaction Log
        </h3>
      </div>
      <div ref={scrollRef} className="h-44 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 && (
          <div className="text-[var(--text-dim)] text-center py-4 opacity-50" style={{ fontSize: "var(--text-xs)" }}>Roll the dice to begin</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className={`leading-relaxed pl-2.5 py-0.5 ${LOG_COLORS[log.type]} ${LOG_BORDER_CLASS[log.type]}`} style={{ fontSize: "var(--text-sm)" }}>
            {log.type === "trash_talk" ? (
              <span>
                <span className={`font-semibold ${PLAYER_NAME_COLORS[log.playerIndex] || ""}`}>{log.playerName}</span>
                {': "'}{log.message}{'"'}
              </span>
            ) : log.type === "system" ? (
              <span>{log.message}</span>
            ) : (
              <span>
                <span className={`font-semibold ${PLAYER_NAME_COLORS[log.playerIndex] || ""}`}>{log.playerName}</span>
                {" "}{log.message}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Solo mode wrapper — reads logs from GameProvider context */
export function GameLogPanel() {
  const { logs } = useGame();
  return <GameLogView logs={logs} />;
}
