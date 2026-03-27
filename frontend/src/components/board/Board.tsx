"use client";

import { useState } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@onelabs/dapp-kit";
import { Transaction } from "@onelabs/sui/transactions";
import { useGame } from "@/providers/GameProvider";
import { Space } from "./Space";
import { TurnActions } from "@/components/game/TurnActions";
import { ChatPanel } from "@/components/game/ChatPanel";
import { HowToPlayButton } from "@/components/game/HowToPlay";
import { BOARD_SPACES, AI_PERSONALITIES, AIPersonality } from "@/lib/types";
import { PACKAGE_ID } from "@/lib/constants";
import { DefiIQScore } from "@/components/game/DefiIQScore";
import { VictoryCard } from "@/components/game/VictoryCard";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { AIBubble } from "@/components/game/AIBubble";

const PLAYER_COLORS = ["var(--amber)", "var(--coral)", "var(--teal)", "var(--purple)"];
import { Gamepad2, Dices, ShieldCheck, Bot } from "lucide-react";
const PLAYER_ICONS = [Gamepad2, Dices, ShieldCheck, Bot];

function getPlayerDisplayName(p: { isAi: boolean; aiPersonality: AIPersonality | null }): string {
  if (!p.isAi) return "You";
  if (p.aiPersonality && AI_PERSONALITIES[p.aiPersonality]) return AI_PERSONALITIES[p.aiPersonality].name;
  return "AI";
}

function getPlayerIcon(p: { isAi: boolean; aiPersonality: AIPersonality | null }, index: number) {
  if (!p.isAi) return Gamepad2;
  if (p.aiPersonality && AI_PERSONALITIES[p.aiPersonality]) return AI_PERSONALITIES[p.aiPersonality].icon;
  return PLAYER_ICONS[index] || Gamepad2;
}

function getPlayerColor(p: { isAi: boolean; aiPersonality: AIPersonality | null }, index: number): string {
  if (!p.isAi) return "var(--teal)";
  if (p.aiPersonality === "degen") return "var(--coral)";
  if (p.aiPersonality === "whale") return "var(--teal)";
  if (p.aiPersonality === "mev_bot") return "var(--purple)";
  return PLAYER_COLORS[index] || "var(--text)";
}

export function GameBoard() {
  const { game, highlightedSpace, aiProcessing } = useGame();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);

  if (game.status === "finished") {
    const winner = game.players.find((p) => p.addr === game.winner);
    const isPlayerWinner = winner && !winner.isAi;

    // Find the first valid property index for NFT mint (instead of passing count)
    const firstPropertyIndex = game.players[0].propertiesOwned.length > 0
      ? game.players[0].propertiesOwned[0]
      : 1; // fallback to space 1

    return (
      <div className="min-h-screen flex flex-col items-center py-16 gap-8 ankara-bg overflow-y-auto">
        <div className="geo-border fixed top-0 left-0 right-0 z-50" />
        <h1 className="font-bold tracking-[-2px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-hero)" }}>
          {isPlayerWinner ? (
            <span className="text-[var(--teal)]">You Win</span>
          ) : (
            <span className="text-[var(--coral)]">Game Over</span>
          )}
        </h1>
        <p className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-base)" }}>
          {isPlayerWinner
            ? `Dominated the board in ${game.turnNumber} turns`
            : `${winner?.aiPersonality === "degen" ? "Degen Trader" : winner?.aiPersonality === "whale" ? "Whale" : "MEV Bot"} wins — ${game.turnNumber} turns`}
        </p>

        {/* Final Standings */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6 shadow-[var(--shadow-elevated)]">
          <div className="text-[var(--text-dim)] mb-4 uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>Final Standings</div>
          {game.players.map((p, i) => (
            <div key={i} className="flex justify-between gap-12 py-2 border-b border-[var(--border)] last:border-0" style={{ fontSize: "var(--text-sm)" }}>
              <span className={p.isBankrupt ? "text-[var(--red)] line-through" : "text-[var(--text)]"}>
                {!p.isAi ? "You" : p.aiPersonality === "degen" ? "Degen" : p.aiPersonality === "whale" ? "Whale" : "MEV Bot"}
              </span>
              <span className="font-semibold text-[var(--teal)] tabular-nums">{p.balance.toLocaleString()} OCT</span>
            </div>
          ))}
        </div>

        {/* DeFi IQ Score */}
        {isPlayerWinner && <DefiIQScore game={game} />}

        {/* Shareable Victory Card */}
        {isPlayerWinner && <VictoryCard game={game} />}

        {/* Victory NFT Mint */}
        {isPlayerWinner && !minted && (
          <button
            onClick={async () => {
              setMinting(true);
              setMintError(null);
              try {
                const tx = new Transaction();
                tx.moveCall({
                  target: `${PACKAGE_ID}::game::mint_demo_nft`,
                  arguments: [tx.pure.u8(firstPropertyIndex)],
                });
                const result = await signAndExecute({ transaction: tx });
                await client.waitForTransaction({ digest: result.digest });
                setMinted(true);
              } catch (e: any) {
                console.error("mint_demo_nft failed:", e);
                setMintError(e.message || "Failed to mint NFT");
              }
              setMinting(false);
            }}
            disabled={minting}
            className="btn px-10 py-3.5 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold uppercase tracking-[2px] hover:brightness-110 shadow-[var(--shadow-elevated)] disabled:opacity-50"
            style={{ fontSize: "var(--text-xs)" }}
          >
            {minting ? "Minting..." : "Mint Victory NFT"}
          </button>
        )}

        {minted && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-[var(--teal)] font-bold uppercase tracking-[1px]" style={{ fontSize: "var(--text-sm)" }}>
              Victory NFT Minted!
            </div>
            <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>
              Check your OneWallet for your new NFT
            </div>
          </div>
        )}

        {mintError && (
          <div className="text-[var(--red)]" style={{ fontSize: "var(--text-xs)" }}>{mintError}</div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn px-10 py-3.5 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold uppercase tracking-[2px] hover:brightness-110 shadow-[var(--shadow-elevated)]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tutorial overlay — shown once on first play */}
      <TutorialOverlay />

      {/* Top bar */}
      <div className="geo-border" />
      <nav className="bg-[rgba(13,27,42,0.95)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-40 shadow-[0_1px_12px_rgba(0,0,0,0.3)]">
        <div className="max-w-[1800px] mx-auto px-3 md:px-4 h-auto md:h-14 py-2 md:py-0 flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/oneboard-logo.jpg" alt="OneBoard" className="w-8 h-8 rounded-full object-cover" />
            <h1 className="font-bold tracking-[-0.5px] hidden sm:block" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>
              <span className="text-[var(--white)]">One</span>
              <span className="text-[var(--teal)]">Board</span>
            </h1>
          </div>

          {/* Player strips */}
          <div className="flex-1 flex items-center justify-center gap-1 md:gap-2 flex-wrap md:flex-nowrap order-3 md:order-none w-full md:w-auto">
            {game.players.map((p, i) => {
              const color = getPlayerColor(p, i);
              const isActive = game.currentTurn === i;
              const isBankrupt = p.isBankrupt;
              const propCount = p.propertiesOwned.length;
              const isExpanded = expandedPlayer === i;
              return (
                <div key={i} className="relative">
                  <div
                    onClick={() => setExpandedPlayer(isExpanded ? null : i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-sharp)] transition-all cursor-pointer ${
                      isBankrupt ? "opacity-40" : "hover:brightness-110"
                    }`}
                    style={{
                      background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                      borderLeft: `3px solid ${color}`,
                      boxShadow: isActive ? `inset 0 0 0 1px ${color}` : "none",
                    }}
                  >
                    {(() => { const Icon = getPlayerIcon(p, i); return <Icon size={14} />; })()}
                    <span
                      className="font-semibold truncate"
                      style={{ fontSize: "11px", color, maxWidth: "80px" }}
                    >
                      {getPlayerDisplayName(p)}
                    </span>
                    <span className="text-[var(--text-dim)] tabular-nums font-semibold" style={{ fontSize: "11px" }}>
                      {isBankrupt ? "OUT" : `${p.balance.toLocaleString()}`}
                    </span>
                    {propCount > 0 && !isBankrupt && (
                      <span className="text-[var(--text-dim)] tabular-nums" style={{ fontSize: "9px", background: "rgba(255,255,255,0.06)", padding: "1px 4px", borderRadius: "2px" }}>
                        {propCount}
                      </span>
                    )}
                  </div>
                  {/* Expanded dropdown */}
                  {isExpanded && !isBankrupt && (
                    <div
                      className="absolute top-full left-0 mt-1 z-50 bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-3 min-w-[200px] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
                      style={{ animation: "fadeIn 0.15s ease-out" }}
                    >
                      <div className="text-[var(--text-dim)] uppercase tracking-[1px] mb-2" style={{ fontFamily: "var(--font-heading)", fontSize: "9px" }}>
                        {getPlayerDisplayName(p)}&apos;s Assets
                      </div>
                      <div className="text-[var(--teal)] font-semibold tabular-nums mb-2" style={{ fontSize: "var(--text-sm)" }}>
                        {p.balance.toLocaleString()} OCT
                      </div>
                      {p.jailTurns > 0 && (
                        <div className="text-[var(--red)] mb-2" style={{ fontSize: "var(--text-xs)" }}>
                          Jailed ({p.jailTurns} {p.jailTurns === 1 ? "turn" : "turns"})
                        </div>
                      )}
                      {propCount > 0 ? (
                        <div className="flex flex-col gap-1">
                          {p.propertiesOwned.map((idx) => {
                            const lvl = game.propertyLevels.get(idx) || 0;
                            return (
                              <div key={idx} className="flex items-center justify-between gap-2" style={{ fontSize: "var(--text-xs)" }}>
                                <span className="text-[var(--text)]">{BOARD_SPACES[idx].name}</span>
                                {lvl > 0 && (
                                  <span className="text-[var(--amber)]">Lv{lvl}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>No properties</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Turn counter + help */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
              <span className="uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Turn</span>
              <span className="text-[var(--text)] font-semibold tabular-nums">{game.turnNumber}</span>
            </div>
            <HowToPlayButton />
          </div>
        </div>
      </nav>

      {/* Main layout: board + chat */}
      <div className="max-w-[1800px] mx-auto w-full px-2 md:px-4 py-2 md:py-4 flex flex-col md:flex-row gap-3 md:gap-4 overflow-auto md:overflow-hidden" style={{ height: "auto", minHeight: "calc(100vh - 78px)" }}>
        {/* Left: Board */}
        <div className="w-full md:flex-[65] min-w-0 overflow-hidden">
          <div className="board-grid">
            {BOARD_SPACES.map((space) => (
              <Space
                key={space.index}
                space={space}
                ownerIndex={game.propertyOwners.get(space.index)}
                level={game.propertyLevels.get(space.index) || 0}
                playersHere={game.players
                  .map((p, i) => ({ ...p, index: i }))
                  .filter((p) => p.position === space.index && !p.isBankrupt)}
                highlighted={highlightedSpace === space.index}
              />
            ))}

            {/* Center area: TV screen with dice + actions */}
            <div className="board-center flex items-center justify-center p-2">
              <div className="tv-frame w-full h-full relative">
                <div className="tv-bezel absolute inset-0 rounded-[12px]" />
                <div className="tv-screen relative z-10 flex flex-col items-center h-full rounded-[8px] mx-2.5 my-2.5 overflow-y-auto overflow-x-hidden p-3 gap-1">
                  <div className="tv-scanlines absolute inset-0 pointer-events-none z-20" />
                  {/* Logo watermark */}
                  <img src="/images/oneboard-logo.jpg" alt="" className="absolute inset-0 m-auto w-16 h-16 rounded-full object-cover opacity-[0.06] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-2 w-full my-auto">
                    {aiProcessing && (
                      <div className="flex flex-col items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex justify-center">
                          {(() => { const p = game.players[game.currentTurn]; const Icon = p?.aiPersonality ? AI_PERSONALITIES[p.aiPersonality as AIPersonality].icon : Gamepad2; return <Icon size={36} style={{ color: p?.aiPersonality ? AI_PERSONALITIES[p.aiPersonality as AIPersonality].color : "var(--teal)" }} />; })()}
                        </div>
                        <span className="text-[var(--text-dim)] uppercase tracking-[2px]" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>
                          {game.players[game.currentTurn]?.aiPersonality
                            ? AI_PERSONALITIES[game.players[game.currentTurn].aiPersonality as AIPersonality].name
                            : "Player"} thinking...
                        </span>
                      </div>
                    )}
                    {!aiProcessing && <TurnActions />}
                    {/* AI trash talk bubble */}
                    <AIBubble />
                  </div>
                </div>
                {/* Power LED */}
                <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[5px] h-[5px] rounded-full bg-[var(--teal)]" style={{ boxShadow: "0 0 4px var(--teal)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chat Panel */}
        <div className="w-full md:flex-[35] min-w-0 h-[400px] md:h-full overflow-hidden">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
