"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSuiClient } from "@onelabs/dapp-kit";
import { GameState, BOARD_SPACES, BOARD_SIZE } from "@/lib/types";

function parsePersonality(val: number): "degen" | "whale" | "mev_bot" | null {
  if (val === 0) return "degen";
  if (val === 1) return "whale";
  if (val === 2) return "mev_bot";
  return null;
}

function parseGameFields(fields: any): GameState | null {
  try {
    const players = (fields.players || []).map((p: any) => {
      const f = p.fields || p;
      return {
        addr: f.addr,
        balance: parseInt(f.balance || "0"),
        position: f.position,
        isBankrupt: f.is_bankrupt,
        isAi: f.is_ai,
        aiPersonality: parsePersonality(f.ai_personality),
        jailTurns: f.jail_turns,
        propertiesOwned: (f.properties_owned || []).map(Number),
        mortgagedProperties: (f.mortgaged_properties || []).map(Number),
      };
    });

    const propertyOwners = new Map<number, number>();
    const propertyLevels = new Map<number, number>();

    for (let i = 0; i < players.length; i++) {
      for (const propIdx of players[i].propertiesOwned) {
        propertyOwners.set(propIdx, i);
      }
    }

    return {
      id: "",
      players,
      currentTurn: parseInt(fields.current_turn || "0"),
      turnNumber: parseInt(fields.turn_number || "0"),
      status: fields.status === 0 ? "lobby" : fields.status === 1 ? "active" : "finished",
      winner: fields.winner === "0x0000000000000000000000000000000000000000000000000000000000000000" ? null : fields.winner,
      hasRolled: fields.has_rolled,
      propertyOwners,
      propertyLevels,
      auctionInProgress: null,
      lastRoll: [0, 0] as [number, number],
      doublesCount: 0,
      difficulty: "normal" as const,
    };
  } catch (e) {
    console.error("Failed to parse game:", e);
    return null;
  }
}

export function useGameOnChain(gameId: string | null, pollInterval = 3000) {
  const client = useSuiClient();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const obj = await client.getObject({
        id: gameId,
        options: { showContent: true },
      });

      clearTimeout(timeout);

      // Check if object exists
      if ("error" in obj && obj.error) {
        const errCode = (obj.error as any)?.code;
        if (errCode === "notExists") {
          setError("Game not found on chain. It may have expired or the ID is incorrect.");
        } else {
          setError(`On-chain error: ${errCode || "unknown"}`);
        }
        setLoading(false);
        return;
      }

      if (obj.data?.content && "fields" in obj.data.content) {
        const parsed = parseGameFields(obj.data.content.fields);
        if (parsed) {
          parsed.id = gameId;
          setGame(parsed);
          setError(null);
          setRetryCount(0);
        }
      }
    } catch (e: any) {
      const msg = e.message || "Failed to fetch game";
      console.error(`Fetch game attempt failed: ${msg}`);
      setError(msg);

      // Auto-retry with backoff
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        const backoff = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(fetchGame, backoff);
      }
    }
    setLoading(false);
  }, [gameId, client, retryCount]);

  // Initial fetch
  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Polling (only when game is loaded successfully)
  useEffect(() => {
    if (!gameId || !game) return;
    const interval = setInterval(fetchGame, pollInterval);
    return () => clearInterval(interval);
  }, [gameId, pollInterval, fetchGame, game]);

  return { game, loading, error, refetch: fetchGame, retryCount };
}
