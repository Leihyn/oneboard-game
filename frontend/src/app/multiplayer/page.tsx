"use client";

import { useState, useEffect, useCallback } from "react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@onelabs/dapp-kit";
import { Transaction } from "@onelabs/sui/transactions";
import { PACKAGE_ID, ONECHAIN_RPC } from "@/lib/constants";

interface LobbyGame {
  id: string;
  creator: string;
  playerCount: number;
  maxPlayers: number;
  status: string;
}

export default function MultiplayerPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [joinGameId, setJoinGameId] = useState("");
  const [currentLobby, setCurrentLobby] = useState<LobbyGame | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!account) return;
    setCreating(true);
    setError(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::game::create_pvp_game`,
        arguments: [tx.pure.u64(maxPlayers)],
      });

      const result = await signAndExecute({ transaction: tx });
      const txDetails = await client.waitForTransaction({ digest: result.digest, options: { showObjectChanges: true, showEvents: true } });
      const gameObj = txDetails.objectChanges?.find(
        (c: any) => c.type === "created" && c.objectType?.includes("::game::Game")
      );

      if (gameObj && "objectId" in gameObj) {
        setCurrentLobby({
          id: gameObj.objectId,
          creator: account.address,
          playerCount: 1,
          maxPlayers,
          status: "lobby",
        });
      }
    } catch (e: any) {
      setError(e.message || "Failed to create game");
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!account || !joinGameId) return;
    setJoining(true);
    setError(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::game::join_game`,
        arguments: [tx.object(joinGameId)],
      });

      await signAndExecute({ transaction: tx });
      // Fetch actual game state after joining
      const obj = await client.getObject({ id: joinGameId, options: { showContent: true } });
      let joinedMaxPlayers = 4;
      let joinedPlayerCount = 1;
      if (obj.data?.content && "fields" in obj.data.content) {
        const fields = obj.data.content.fields as any;
        joinedMaxPlayers = parseInt(fields.max_players || fields.maxPlayers || "4") || 4;
        joinedPlayerCount = fields.players?.length || 1;
      }
      setCurrentLobby({
        id: joinGameId,
        creator: "",
        playerCount: joinedPlayerCount,
        maxPlayers: joinedMaxPlayers,
        status: "lobby",
      });
    } catch (e: any) {
      setError(e.message || "Failed to join game");
    }
    setJoining(false);
  };

  const handleStart = async () => {
    if (!account || !currentLobby) return;
    setStarting(true);
    setError(null);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::game::start_game`,
        arguments: [tx.object(currentLobby.id)],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("start_game result:", result);
      await client.waitForTransaction({ digest: result.digest });
      setCurrentLobby((prev) => prev ? { ...prev, status: "active" } : null);
    } catch (e: any) {
      console.error("start_game error:", e);
      setError(e.message || "Failed to start game");
    }
    setStarting(false);
  };

  // Poll lobby state
  useEffect(() => {
    if (!currentLobby) return;
    const interval = setInterval(async () => {
      try {
        const obj = await client.getObject({
          id: currentLobby.id,
          options: { showContent: true },
        });
        if (obj.data?.content && "fields" in obj.data.content) {
          const fields = obj.data.content.fields as any;
          const playerCount = fields.players?.length || 0;
          const maxP = parseInt(fields.max_players || fields.maxPlayers || "0") || playerCount;
          const status = fields.status === 0 ? "lobby" : fields.status === 1 ? "active" : "finished";
          setCurrentLobby((prev) => prev ? { ...prev, playerCount, maxPlayers: maxP || prev.maxPlayers, status } : null);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [currentLobby?.id, client]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="geo-border" />
      <nav className="bg-[rgba(13,27,42,0.92)] backdrop-blur-sm border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-[800px] mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-[-0.5px]" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="text-[var(--white)]">One</span>
            <span className="text-[var(--teal)]">Board</span>
            <span className="text-[var(--text-dim)] text-sm font-normal ml-2">Multiplayer</span>
          </a>
          <ConnectButton />
        </div>
      </nav>

      <div className="flex-1 max-w-[800px] mx-auto w-full px-6 py-8">
        {!account ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Player vs Player
            </h2>
            <p className="text-[var(--text-dim)] mb-6">Connect your wallet to create or join a PvP game.</p>
            <ConnectButton />
          </div>
        ) : currentLobby ? (
          /* Lobby View */
          <div className="max-w-md mx-auto">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {currentLobby.status === "active" ? (
                  <span className="text-[var(--teal)]">Game Started!</span>
                ) : (
                  "Waiting for Players"
                )}
              </h2>

              {/* Game ID for sharing */}
              <div className="mb-4">
                <div className="text-[9px] text-[var(--text-dim)] uppercase tracking-[1px] mb-1">Game ID (share with friends)</div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-sharp)] p-2 text-[10px] text-[var(--teal)] break-all font-mono">
                  {currentLobby.id}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(currentLobby.id)}
                  className="btn mt-1 text-[9px] text-[var(--text-dim)] hover:text-[var(--text)] uppercase tracking-[1px]"
                >
                  Copy ID
                </button>
              </div>

              {/* Player count */}
              <div className="flex items-center justify-between mb-4 py-3 border-y border-[var(--border)]">
                <span className="text-[var(--text-dim)] text-sm">Players</span>
                <span className="text-[var(--text)] font-semibold tabular-nums">
                  {currentLobby.playerCount} / {currentLobby.maxPlayers}
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-block w-2 h-2 rounded-full ${currentLobby.status === "active" ? "bg-[var(--green)]" : "bg-[var(--amber)] animate-pulse"}`} />
                <span className="text-sm text-[var(--text-dim)]">
                  {currentLobby.status === "active"
                    ? "Game is live — play in the main game view"
                    : `Waiting for ${currentLobby.maxPlayers - currentLobby.playerCount} more player(s)...`}
                </span>
              </div>

              {/* Start button (creator only) */}
              {currentLobby.status === "lobby" && currentLobby.creator === account.address && currentLobby.playerCount >= 2 && (
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="btn w-full py-3 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold text-sm uppercase tracking-[2px] hover:brightness-110 disabled:opacity-50"
                >
                  {starting ? "Starting..." : "Start Game"}
                </button>
              )}

              {currentLobby.status === "active" && (
                <a
                  href={`/game/${currentLobby.id}`}
                  className="btn block w-full py-3 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold text-sm uppercase tracking-[2px] text-center hover:brightness-110"
                >
                  Enter Game
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Create / Join */
          <div className="max-w-md mx-auto space-y-6">
            {/* Create */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Create Game
              </h2>
              <div className="mb-4">
                <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-[1px] block mb-2">
                  Number of Players
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setMaxPlayers(n)}
                      className={`btn flex-1 py-2 border rounded-[var(--r-sharp)] text-sm font-semibold ${
                        maxPlayers === n
                          ? "border-[var(--teal)] text-[var(--teal)] bg-[var(--teal)]/10"
                          : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      {n}P
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn w-full py-3 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold text-sm uppercase tracking-[2px] hover:brightness-110 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Lobby"}
              </button>
            </div>

            {/* Join */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-6">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Join Game
              </h2>
              <div className="mb-4">
                <label className="text-[11px] text-[var(--text-dim)] uppercase tracking-[1px] block mb-2">
                  Game ID
                </label>
                <input
                  type="text"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-sharp)] text-[var(--text)] text-sm placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--teal)]"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={joining || !joinGameId}
                className="btn w-full py-3 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold text-sm uppercase tracking-[2px] hover:brightness-110 disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Lobby"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[var(--red)]/10 border border-[var(--red)]/20 rounded-[var(--r-sharp)] text-[var(--red)] text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
