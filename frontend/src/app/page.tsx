"use client";

import { useState } from "react";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@onelabs/dapp-kit";
import { Transaction } from "@onelabs/sui/transactions";
import { GameBoard } from "@/components/board/Board";
import { GameProvider } from "@/providers/GameProvider";
import { HowToPlayButton } from "@/components/game/HowToPlay";
import { AIDifficulty, DIFFICULTY_LABELS } from "@/lib/types";
import { PACKAGE_ID } from "@/lib/constants";
import { Dices, ShieldCheck, Bot, type LucideIcon } from "lucide-react";

const CLOCK = "0x6";

export default function Home() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [gameId, setGameId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<AIDifficulty>("normal");
  const [creating, setCreating] = useState(false);

  // Enter game — wallet must be connected
  if (gameId && account) {
    return (
      <GameProvider gameId={gameId} playerAddress={account.address} difficulty={difficulty}>
        <GameBoard />
      </GameProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden ankara-bg">
      <div className="geo-border fixed top-0 left-0 right-0 z-50" />

      <div className="absolute top-12 left-8 w-16 h-16 border-t-2 border-l-2 border-[var(--coral)] opacity-30" />
      <div className="absolute top-12 right-8 w-16 h-16 border-t-2 border-r-2 border-[var(--teal)] opacity-30" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[var(--amber)] opacity-30" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[var(--purple)] opacity-30" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-4">
        <div className="text-center">
          <img src="/images/oneboard-logo.jpg" alt="OneBoard" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto mb-6 shadow-[0_0_40px_rgba(0,212,170,0.2)]" />
          <h1 className="font-bold tracking-[-2px] mb-4" style={{ fontSize: "var(--text-hero)", fontFamily: "var(--font-heading)" }}>
            <span className="text-[var(--white)]">One</span>
            <span className="text-[var(--teal)]">Board</span>
          </h1>
          <p className="text-[var(--text-dim)] mb-3" style={{ fontSize: "var(--text-lg)" }}>
            The DeFi Board Game on OneChain
          </p>
          <p className="text-[var(--text-dim)] max-w-md mx-auto leading-relaxed" style={{ fontSize: "var(--text-base)" }}>
            Buy real OneChain protocols. Outsmart AI opponents. Earn Dynamic NFTs.
          </p>
        </div>

        {/* Difficulty selector — always visible */}
        {!gameId && (
          <div className="flex flex-col gap-6 items-center">
            {account && (
              <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--green)] mr-1.5" />
                {account.address.slice(0, 8)}...{account.address.slice(-6)}
              </div>
            )}

            {/* Difficulty selector — segmented control */}
            <div className="flex flex-col gap-3 items-center">
              <span className="text-[var(--text-dim)] uppercase tracking-[1px]" style={{ fontSize: "var(--text-xs)" }}>Difficulty</span>
              <div className="flex bg-[var(--surface)] rounded-[var(--r-sharp)] p-1 border border-[var(--border)]">
                {(["easy", "normal", "hard"] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`btn px-5 py-2 rounded-[var(--r-sharp)] font-semibold transition-all duration-150 ${
                      difficulty === d
                        ? "bg-[var(--teal)] text-[var(--navy)] shadow-[var(--shadow-card)]"
                        : "text-[var(--text-dim)] hover:text-[var(--text)]"
                    }`}
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {DIFFICULTY_LABELS[d].name}
                  </button>
                ))}
              </div>
              <span className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>{DIFFICULTY_LABELS[difficulty].description}</span>
            </div>

            {/* Play Now — on-chain if wallet connected */}
            {account ? (
              <button
                onClick={async () => {
                  setCreating(true);
                  try {
                    const tx = new Transaction();
                    tx.moveCall({
                      target: `${PACKAGE_ID}::game::create_game`,
                      arguments: [tx.object(CLOCK)],
                    });
                    const result = await signAndExecute({ transaction: tx });
                    const details = await client.waitForTransaction({ digest: result.digest, options: { showObjectChanges: true } });
                    const gameObj = details.objectChanges?.find(
                      (c: any) => c.type === "created" && c.objectType?.includes("::game::Game")
                    );
                    const onChainId = gameObj && "objectId" in gameObj ? gameObj.objectId : null;
                    setGameId(onChainId || "local-" + Date.now());
                  } catch (e) {
                    console.error("create_game failed, falling back to local:", e);
                    setGameId("local-" + Date.now());
                  }
                  setCreating(false);
                }}
                disabled={creating}
                className="btn px-14 py-4 bg-[var(--coral)] text-[var(--white)] font-semibold uppercase tracking-[3px] rounded-[var(--r-sharp)] hover:brightness-110 shadow-[var(--shadow-elevated)] disabled:opacity-50"
                style={{ fontSize: "var(--text-base)" }}
              >
                {creating ? "Creating Game..." : "Play Now"}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <ConnectButton connectText="Connect Wallet to Play" />
                <span className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>
                  Wallet required to play
                </span>
              </div>
            )}

            <div className="flex gap-3 items-center">
              <span className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-xs)" }}>1 vs 3 AI opponents</span>
              <HowToPlayButton />
            </div>

            {/* Wallet connect + PvP links */}
            <div className="flex gap-3 items-center">
              <a href="/multiplayer" className="btn px-5 py-2.5 border border-[var(--teal)] text-[var(--teal)] rounded-[var(--r-sharp)] font-semibold hover:bg-[var(--teal)] hover:text-[var(--navy)]" style={{ fontSize: "var(--text-xs)" }}>
                PvP Multiplayer
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-5 mt-4">
          {([
            { icon: Dices, name: "Degen Trader", desc: "Buys everything. YOLO.", color: "var(--coral)" },
            { icon: ShieldCheck, name: "Conservative Whale", desc: "Plays it safe. Waits.", color: "var(--teal)" },
            { icon: Bot, name: "MEV Bot", desc: "Pure math. No mercy.", color: "var(--purple)" },
          ] as { icon: LucideIcon; name: string; desc: string; color: string }[]).map((ai) => (
            <div key={ai.name} className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--r-sharp)] p-5 w-48 text-center transition-all duration-200 ease-[var(--ease-out)] hover:border-[var(--border-hover)] hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] cursor-default">
              <div className="flex justify-center mb-3"><ai.icon size={32} style={{ color: ai.color }} /></div>
              <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>{ai.name}</div>
              <div className="text-[var(--text-dim)] mt-1.5" style={{ fontSize: "var(--text-xs)" }}>{ai.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-[var(--text-dim)] mt-8 tracking-wider uppercase opacity-50" style={{ fontSize: "var(--text-xs)" }}>
          Built on OneChain &middot; Move Smart Contracts &middot; Dynamic NFTs
        </p>
      </div>

      <div className="geo-border fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
}
