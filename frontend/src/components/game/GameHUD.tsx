"use client";

import { useGame } from "@/providers/GameProvider";

export function GameHUD() {
  const { game, currentPlayerName } = useGame();
  const player = game.players[0];

  return (
    <div className="flex items-center gap-5" style={{ fontSize: "var(--text-sm)" }}>
      <div className="text-[var(--text-dim)]">
        BAL <span className="text-[var(--teal)] font-semibold tabular-nums">{player.balance.toLocaleString()} OCT</span>
      </div>
      <div className="text-[var(--text-dim)]">
        TURN <span className="text-[var(--text)] font-semibold tabular-nums">{game.turnNumber}</span>
      </div>
      <div className="text-[var(--text-dim)]">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--green)] mr-1" />
        <span className="text-[var(--text)] font-semibold">{currentPlayerName}</span>
      </div>
    </div>
  );
}
