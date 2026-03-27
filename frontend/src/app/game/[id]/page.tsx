"use client";

import { useParams } from "next/navigation";
import { useCurrentAccount, ConnectButton } from "@onelabs/dapp-kit";
import { useGameOnChain } from "@/hooks/useGameOnChain";
import { useGameActions } from "@/hooks/useGameActions";
import { useToast } from "@/components/game/Toast";
import { BOARD_SPACES, AI_PERSONALITIES } from "@/lib/types";
import { Space } from "@/components/board/Space";
import { GameLogView } from "@/components/game/GameLog";
import { GameLog } from "@/providers/GameProvider";
import { HowToPlayButton } from "@/components/game/HowToPlay";
import { PropertyNFTCard } from "@/components/game/PropertyNFTCard";
import { useState, useRef, useEffect, useCallback } from "react";
import { GameState } from "@/lib/types";

function usePvpLogs(game: GameState | null, getPlayerLabel: (i: number) => string) {
  const [logs, setLogs] = useState<GameLog[]>([]);
  const prevRef = useRef<GameState | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!game || game.status !== "active") return;
    const prev = prevRef.current;
    prevRef.current = game;
    if (!prev) return;

    const newLogs: GameLog[] = [];
    const add = (playerIndex: number, message: string, type: GameLog["type"]) => {
      newLogs.push({
        id: idRef.current++,
        turn: game.turnNumber,
        playerIndex,
        playerName: getPlayerLabel(playerIndex),
        message,
        type,
      });
    };

    // Detect turn change
    if (game.turnNumber !== prev.turnNumber) {
      add(game.currentTurn, "turn started", "system");
    }

    for (let i = 0; i < game.players.length; i++) {
      const cur = game.players[i];
      const old = prev.players[i];
      if (!cur || !old) continue;

      // Position changed — player moved
      if (cur.position !== old.position && game.hasRolled) {
        add(i, `moved to ${BOARD_SPACES[cur.position].name}`, "roll");
      }

      // Balance decreased — could be rent, tax, or purchase
      if (cur.balance < old.balance) {
        const diff = old.balance - cur.balance;
        // Check if they bought a new property
        const newProps = cur.propertiesOwned.filter((p) => !old.propertiesOwned.includes(p));
        if (newProps.length > 0) {
          for (const p of newProps) {
            add(i, `bought ${BOARD_SPACES[p].name} for ${BOARD_SPACES[p].basePrice} OCT`, "buy");
          }
        } else {
          const space = BOARD_SPACES[cur.position];
          if (space.spaceType === "tax") {
            add(i, `paid ${diff} OCT tax`, "tax");
          } else if (space.spaceType === "rug_pull") {
            add(i, `lost ${diff} OCT to rug pull`, "rug_pull");
          } else if (space.spaceType === "property" && game.propertyOwners.has(cur.position)) {
            add(i, `paid ${diff} OCT rent`, "rent");
          }
        }
      }

      // Balance increased — bonus/airdrop/chance
      if (cur.balance > old.balance) {
        const diff = cur.balance - old.balance;
        const space = BOARD_SPACES[cur.position];
        if (space.spaceType === "chance") {
          add(i, `received ${diff} OCT (chance)`, "chance");
        } else if (space.name.toLowerCase().includes("airdrop")) {
          add(i, `received ${diff} OCT airdrop`, "airdrop");
        } else if (space.name.toLowerCase().includes("governance") || space.name.toLowerCase().includes("dao")) {
          add(i, `received ${diff} OCT from governance`, "governance");
        } else if (cur.position !== old.position) {
          add(i, `received ${diff} OCT`, "system");
        }
      }

      // Jail
      if (cur.jailTurns > 0 && old.jailTurns === 0) {
        add(i, "sent to jail", "jail");
      }
      if (cur.jailTurns === 0 && old.jailTurns > 0) {
        add(i, "freed from jail", "jail_bail");
      }

      // Bankrupt
      if (cur.isBankrupt && !old.isBankrupt) {
        add(i, "went bankrupt!", "bankrupt");
      }
    }

    if (newLogs.length > 0) {
      setLogs((prev) => [...prev, ...newLogs]);
    }
  }, [game, getPlayerLabel]);

  return logs;
}

export default function PvPGamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const account = useCurrentAccount();
  const { game, loading, error, refetch } = useGameOnChain(gameId, 2000);
  const actions = useGameActions();
  const { toast } = useToast();
  const [acting, setActing] = useState(false);

  const myIndex = game ? game.players.findIndex((p) => p.addr === account?.address) : -1;

  const getPlayerLabel = useCallback((index: number) => {
    if (!game) return `Player ${index + 1}`;
    if (index === myIndex) return "You";
    const p = game.players[index];
    if (p?.isAi && p.aiPersonality) return AI_PERSONALITIES[p.aiPersonality].name;
    return `Player ${index + 1}`;
  }, [game, myIndex]);

  const pvpLogs = usePvpLogs(game, getPlayerLabel);

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          <span className="text-[var(--white)]">One</span>
          <span className="text-[var(--teal)]">Board</span>
        </h1>
        <p className="text-[var(--text-dim)]">Connect wallet to join the game</p>
        <ConnectButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-dim)]">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="geo-border fixed top-0 left-0 right-0 z-50" />
        <img src="/images/oneboard-logo.jpg" alt="OneBoard" className="w-16 h-16 rounded-full object-cover opacity-50" />
        <div className="text-[var(--red)] font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>
          Failed to load game
        </div>
        <div className="text-[var(--text-dim)] text-sm max-w-md text-center">{error}</div>
        <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>
          Game ID: <span className="font-mono text-[var(--text)]">{gameId?.slice(0, 16)}...</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn px-6 py-2.5 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold text-sm hover:brightness-110"
          >
            Retry
          </button>
          <a
            href="/multiplayer"
            className="btn px-6 py-2.5 border border-[var(--border)] text-[var(--text-dim)] rounded-[var(--r-sharp)] text-sm hover:border-[var(--border-hover)] hover:text-[var(--text)]"
          >
            Back to Lobby
          </a>
        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
          <a
            href="/"
            className="text-[var(--text-dim)] hover:text-[var(--teal)] transition-colors"
            style={{ fontSize: "var(--text-xs)" }}
          >
            or play Solo vs AI instead
          </a>
          <span className="text-[var(--text-dim)]" style={{ fontSize: "9px" }}>
            The OneChain testnet may be temporarily unavailable
          </span>
        </div>
      </div>
    );
  }

  // Find my player index
  const isMyTurn = game.currentTurn === myIndex && game.status === "active" && !acting;
  const currentPlayer = game.players[game.currentTurn];
  const myPlayer = myIndex >= 0 ? game.players[myIndex] : null;

  const handleRoll = async () => {
    setActing(true);
    try {
      await actions.rollDice(gameId);
      toast("Dice rolled!", "info", "🎲");
      await refetch();
    } catch (e: any) {
      toast(e.message || "Roll failed", "danger");
    }
    setActing(false);
  };

  const handleBuy = async () => {
    setActing(true);
    try {
      await actions.buyProperty(gameId);
      const space = BOARD_SPACES[game.players[myIndex].position];
      toast(`Bought ${space.name}! NFT minted`, "nft", "🏠");
      await refetch();
    } catch (e: any) {
      toast(e.message || "Buy failed", "danger");
    }
    setActing(false);
  };

  const handleSkip = async () => {
    setActing(true);
    try {
      await actions.skipBuy(gameId);
      await refetch();
    } catch (e: any) {
      toast(e.message || "Skip failed", "danger");
    }
    setActing(false);
  };

  const handleEndTurn = async () => {
    setActing(true);
    try {
      await actions.endTurn(gameId);
      toast("Turn ended", "info");
      await refetch();
    } catch (e: any) {
      toast(e.message || "End turn failed", "danger");
    }
    setActing(false);
  };

  // Game over
  if (game.status === "finished") {
    const isWinner = game.winner === account.address;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="geo-border fixed top-0 left-0 right-0 z-50" />
        <h1 className="text-5xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          {isWinner ? <span className="text-[var(--teal)]">You Win!</span> : <span className="text-[var(--coral)]">Game Over</span>}
        </h1>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6">
          {game.players.map((p, i) => (
            <div key={i} className="flex justify-between gap-12 text-sm py-1.5 border-b border-[var(--border)] last:border-0">
              <span className={p.isBankrupt ? "text-[var(--red)] line-through" : ""}>{getPlayerLabel(i)}</span>
              <span className="text-[var(--teal)] tabular-nums">{p.balance.toLocaleString()} OCT</span>
            </div>
          ))}
        </div>
        <a href="/multiplayer" className="btn px-6 py-3 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110">
          New Game
        </a>
      </div>
    );
  }

  // Lobby state
  if (game.status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="geo-border fixed top-0 left-0 right-0 z-50" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Waiting for Players
        </h1>
        <div className="text-[var(--text-dim)] tabular-nums">{game.players.length} players joined</div>
        <div className="text-[10px] text-[var(--text-dim)] break-all max-w-sm text-center">Game ID: {gameId}</div>
      </div>
    );
  }

  // Active game
  const pos = myPlayer ? myPlayer.position : 0;
  const space = BOARD_SPACES[pos];
  const isUnownedProperty = game.hasRolled && space.spaceType === "property" && !game.propertyOwners.has(pos);
  const canBuy = isUnownedProperty && myPlayer && myPlayer.balance >= space.basePrice;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--navy)]">
      <div className="geo-border" />
      <nav className="bg-[rgba(13,27,42,0.95)] backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-40 shadow-[0_1px_12px_rgba(0,0,0,0.3)]">
        <div className="max-w-[1800px] mx-auto px-3 md:px-4 py-2 md:py-0 h-auto md:h-14 flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/oneboard-logo.jpg" alt="OneBoard" className="w-8 h-8 rounded-full object-cover" />
            <h1 className="font-bold tracking-[-0.5px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)" }}>
              <span className="text-[var(--white)]">One</span>
              <span className="text-[var(--teal)]">Board</span>
              <span className="text-[var(--text-dim)] font-normal ml-1" style={{ fontSize: "var(--text-xs)" }}>PvP</span>
            </h1>
          </div>

          <div className="flex-1 flex items-center justify-center gap-1 md:gap-2 flex-wrap md:flex-nowrap order-3 md:order-none w-full md:w-auto">
            {game.players.map((p, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-sharp)] ${p.isBankrupt ? "opacity-40" : ""}`}
                style={{
                  background: game.currentTurn === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  borderLeft: `3px solid ${i === myIndex ? "var(--teal)" : "var(--text-dim)"}`,
                  boxShadow: game.currentTurn === i ? "inset 0 0 0 1px var(--teal)" : "none",
                }}
              >
                <span className="font-semibold truncate" style={{ fontSize: "11px", color: i === myIndex ? "var(--teal)" : "var(--text)", maxWidth: "80px" }}>
                  {getPlayerLabel(i)}{i === myIndex ? " (you)" : ""}
                </span>
                <span className="text-[var(--text-dim)] tabular-nums font-semibold" style={{ fontSize: "11px" }}>
                  {p.isBankrupt ? "OUT" : p.balance.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
              <span className="uppercase tracking-[1px]" style={{ fontFamily: "var(--font-heading)", fontSize: "10px" }}>Turn</span>
              <span className="text-[var(--text)] font-semibold tabular-nums">{game.turnNumber}</span>
            </div>
            <span className="text-[var(--text-dim)]" style={{ fontSize: "11px" }}>
              {isMyTurn ? <span className="text-[var(--teal)] font-semibold">Your Turn</span> : `Waiting...`}
            </span>
            <HowToPlayButton />
          </div>
        </div>
      </nav>

      <div className="max-w-[1800px] mx-auto w-full px-2 md:px-4 py-2 md:py-4 flex flex-col md:flex-row gap-3 md:gap-4 overflow-auto md:overflow-hidden" style={{ height: "auto", minHeight: "calc(100vh - 78px)" }}>
        <div className="w-full md:flex-[65] min-w-0 overflow-hidden">
          <div className="board-grid">
            {BOARD_SPACES.map((s) => (
              <Space
                key={s.index}
                space={s}
                ownerIndex={game.propertyOwners.get(s.index)}
                level={game.propertyLevels.get(s.index) || 0}
                playersHere={game.players
                  .map((p, i) => ({ ...p, index: i }))
                  .filter((p) => p.position === s.index && !p.isBankrupt)}
                highlighted={myPlayer?.position === s.index && game.hasRolled}
              />
            ))}

            <div className="board-center flex items-center justify-center p-2">
              <div className="tv-frame w-full h-full relative">
                <div className="tv-bezel absolute inset-0 rounded-[12px]" />
                <div className="tv-screen relative z-10 flex flex-col items-center justify-center h-full rounded-[8px] mx-2.5 my-2.5 overflow-y-auto overflow-x-hidden p-2 gap-1">
                  <div className="tv-scanlines absolute inset-0 pointer-events-none z-20" />
                  <img src="/images/oneboard-logo.jpg" alt="" className="absolute inset-0 m-auto w-16 h-16 rounded-full object-cover opacity-[0.06] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 w-full">
                    {!isMyTurn && (
                      <div className="text-center text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
                        Waiting for {getPlayerLabel(game.currentTurn)}...
                      </div>
                    )}
                    {isMyTurn && !game.hasRolled && (
                      <button onClick={handleRoll} disabled={acting} className="btn px-10 py-3 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold uppercase tracking-[2px] hover:brightness-110 disabled:opacity-50" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
                        {acting ? "Rolling..." : "Roll Dice"}
                      </button>
                    )}
                    {isMyTurn && game.hasRolled && (
                      <>
                        <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
                          Landed on <strong className="text-[var(--text)]" style={{ fontFamily: "var(--font-heading)" }}>{space.name}</strong>
                        </div>
                        {isUnownedProperty && (
                          <div className="flex gap-2">
                            {canBuy && (
                              <button onClick={handleBuy} disabled={acting} className="btn px-5 py-2 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110 disabled:opacity-50" style={{ fontSize: "var(--text-xs)" }}>
                                BUY ({space.basePrice} OCT)
                              </button>
                            )}
                            <button onClick={handleSkip} disabled={acting} className="btn px-5 py-2 bg-[var(--amber)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110 disabled:opacity-50" style={{ fontSize: "var(--text-xs)" }}>
                              SKIP
                            </button>
                          </div>
                        )}
                        <button onClick={handleEndTurn} disabled={acting} className="btn px-6 py-1.5 border border-[var(--border)] text-[var(--text-dim)] rounded-[var(--r-sharp)] hover:border-[var(--border-hover)] hover:text-[var(--text)] disabled:opacity-50" style={{ fontSize: "var(--text-xs)" }}>
                          END TURN
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 z-20">
                  <div className="w-[5px] h-[5px] rounded-full bg-[var(--teal)]" style={{ boxShadow: "0 0 4px var(--teal)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:flex-[35] min-w-0 h-[300px] md:h-full overflow-hidden">
          <div className="flex flex-col h-full bg-[var(--card)] border border-[var(--border)] rounded-[6px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[rgba(13,27,42,0.5)]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse" />
                <span className="font-semibold uppercase tracking-[2px]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xs)" }}>
                  PvP Game
                </span>
              </div>
              <span className="text-[var(--text-dim)]" style={{ fontSize: "10px" }}>
                {game.players.length} players
              </span>
            </div>
            <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-2">
              {game.players.map((player, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-[var(--r-sharp)] ${player.isBankrupt ? "opacity-30" : ""}`}
                  style={{
                    background: game.currentTurn === index ? "rgba(0,212,170,0.08)" : "rgba(255,255,255,0.02)",
                    borderLeft: `3px solid ${game.currentTurn === index ? "var(--teal)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "11px", color: index === myIndex ? "var(--teal)" : "var(--text)" }}>
                      {getPlayerLabel(index)}
                      {index === myIndex && <span className="text-[var(--teal)] ml-1">(you)</span>}
                    </span>
                    {game.currentTurn === index && (
                      <span className="bg-[var(--teal)] text-[var(--navy)] px-1.5 py-0.5 rounded-full font-bold uppercase" style={{ fontSize: "8px" }}>turn</span>
                    )}
                  </div>
                  <div className="flex justify-between" style={{ fontSize: "var(--text-xs)" }}>
                    <span className="text-[var(--text-dim)]">Balance</span>
                    <span className="text-[var(--teal)] font-semibold tabular-nums">{player.balance.toLocaleString()} OCT</span>
                  </div>
                  <div className="flex justify-between" style={{ fontSize: "var(--text-xs)" }}>
                    <span className="text-[var(--text-dim)]">Position</span>
                    <span className="text-[var(--text)]">{BOARD_SPACES[player.position].name}</span>
                  </div>
                  {player.propertiesOwned.length > 0 && (
                    <>
                      <div className="flex justify-between mt-1" style={{ fontSize: "var(--text-xs)" }}>
                        <span className="text-[var(--text-dim)]">Properties</span>
                        <span className="text-[var(--amber)] tabular-nums">{player.propertiesOwned.length}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1.5">
                        {player.propertiesOwned.map((spaceIdx) => (
                          <PropertyNFTCard
                            key={spaceIdx}
                            space={BOARD_SPACES[spaceIdx]}
                            level={game.propertyLevels.get(spaceIdx) || 0}
                            ownerName={getPlayerLabel(index)}
                            compact
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {player.isBankrupt && <div className="text-[var(--red)] font-bold mt-1" style={{ fontSize: "var(--text-xs)" }}>BANKRUPT</div>}
                </div>
              ))}
            </div>
            <div className="px-3 py-2">
              <GameLogView logs={pvpLogs} />
            </div>
            <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[rgba(13,27,42,0.5)]">
              <div className="flex items-center gap-2" style={{ fontSize: "var(--text-xs)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
                <span className="text-[var(--text-dim)]">
                  On-chain game &middot; Every action is a transaction
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
