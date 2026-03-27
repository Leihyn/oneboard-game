"use client";

import { useState } from "react";
import { useGame } from "@/providers/GameProvider";
import { BOARD_SPACES, AI_PERSONALITIES, PlayerState } from "@/lib/types";
import { PropertyNFTCard } from "@/components/game/PropertyNFTCard";
import { STARTING_BALANCE } from "@/lib/constants";
import { ChevronUp, ChevronDown, Lock } from "lucide-react";

const PLAYER_COLORS = ["var(--p0)", "var(--p1)", "var(--p2)", "var(--p3)"];

function getPlayerName(p: PlayerState): string {
  if (!p.isAi) return "You";
  if (p.aiPersonality === "degen") return "Degen Trader";
  if (p.aiPersonality === "whale") return "Whale";
  return "MEV Bot";
}

export function PlayerPanel() {
  const { game } = useGame();
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {game.players.map((player, index) => {
        const isCurrentTurn = game.currentTurn === index;
        const isHuman = !player.isAi;
        const isExpanded = expandedPlayer === index;
        const balancePercent = Math.min(100, (player.balance / STARTING_BALANCE) * 100);

        return (
          <div
            key={index}
            className={`relative bg-[var(--card)] border rounded-[var(--r-sharp)] p-2.5 transition-all duration-200 ease-[var(--ease-out)] ${
              isCurrentTurn
                ? "border-[var(--teal)] shadow-[var(--shadow-elevated)]"
                : "border-[var(--border)] hover:shadow-[var(--shadow-card)]"
            } ${player.isBankrupt ? "opacity-30" : ""}`}
          >
            {/* Active player left accent bar */}
            {isCurrentTurn && (
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-[var(--r-pill)]"
                style={{ backgroundColor: PLAYER_COLORS[index] }}
              />
            )}

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[var(--navy)] ${isCurrentTurn ? "ring-2 ring-offset-2 ring-offset-[var(--card)]" : ""}`}
                style={{
                  backgroundColor: PLAYER_COLORS[index],
                  fontSize: "var(--text-xs)",
                  ...(isCurrentTurn ? { "--tw-ring-color": PLAYER_COLORS[index] } as React.CSSProperties : {}),
                }}
              >
                {isHuman ? "Y" : (() => { const Icon = AI_PERSONALITIES[player.aiPersonality!].icon; return <Icon size={16} />; })()}
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)", color: PLAYER_COLORS[index], fontSize: "var(--text-base)" }}>
                  {isHuman ? "You" : AI_PERSONALITIES[player.aiPersonality!].name}
                  {isCurrentTurn && (
                    <span className="bg-[var(--teal)] text-[var(--navy)] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-[1px]" style={{ fontSize: "var(--text-xs)" }}>
                      turn
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Balance bar */}
            <div className="mb-2">
              <div className="flex justify-between mb-1" style={{ fontSize: "var(--text-xs)" }}>
                <span className="text-[var(--text-dim)]">Balance</span>
                <span className="text-[var(--teal)] font-semibold tabular-nums">{player.balance.toLocaleString()} OCT</span>
              </div>
              <div className="h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-[var(--ease-out)]"
                  style={{ width: `${balancePercent}%`, backgroundColor: PLAYER_COLORS[index] }}
                />
              </div>
            </div>

            {/* Stats row - only shown for active player */}
            {isCurrentTurn && (
              <div className="flex justify-between" style={{ fontSize: "var(--text-xs)" }}>
                <div>
                  <span className="text-[var(--text-dim)]">Position </span>
                  <span className="text-[var(--text)] font-semibold">{BOARD_SPACES[player.position].name}</span>
                </div>
                <div>
                  <span className="text-[var(--text-dim)]">NFTs </span>
                  <span className="text-[var(--text)] font-semibold tabular-nums">{player.propertiesOwned.length}</span>
                </div>
              </div>
            )}

            {/* NFT Collection - only shown for active player */}
            {isCurrentTurn && player.propertiesOwned.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpandedPlayer(isExpanded ? null : index)}
                  className="btn w-full text-[var(--text-dim)] uppercase tracking-[1px] hover:text-[var(--text)] py-1 text-left flex items-center justify-between"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  <span>{player.propertiesOwned.length} Dynamic NFT{player.propertiesOwned.length > 1 ? "s" : ""}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {!isExpanded && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.propertiesOwned.map((idx) => (
                      <PropertyNFTCard
                        key={idx}
                        space={BOARD_SPACES[idx]}
                        level={game.propertyLevels.get(idx) || 0}
                        ownerName={getPlayerName(player)}
                        compact
                      />
                    ))}
                  </div>
                )}

                {isExpanded && (
                  <div className="flex flex-col gap-2 mt-2">
                    {player.propertiesOwned.map((idx) => (
                      <PropertyNFTCard
                        key={idx}
                        space={BOARD_SPACES[idx]}
                        level={game.propertyLevels.get(idx) || 0}
                        ownerName={getPlayerName(player)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {player.isBankrupt && (
              <div className="mt-2 text-[var(--red)] font-bold uppercase tracking-[1px]" style={{ fontSize: "var(--text-xs)" }}>Bankrupt</div>
            )}
            {player.jailTurns > 0 && (
              <div className="mt-1 text-[var(--red)] flex items-center gap-1" style={{ fontSize: "var(--text-xs)" }}><Lock size={12} /> Jailed (<span className="tabular-nums">{player.jailTurns}</span> {player.jailTurns === 1 ? "turn" : "turns"})</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
