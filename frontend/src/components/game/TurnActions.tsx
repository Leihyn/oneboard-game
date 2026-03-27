"use client";

import { useState } from "react";
import { useGame } from "@/providers/GameProvider";
import { BOARD_SPACES, AI_PERSONALITIES, JAIL_BAIL, MORTGAGE_RATE } from "@/lib/types";
import { JAIL_DURATION } from "@/lib/constants";
import { AnimatedDice } from "./Dice";
import { Lock } from "lucide-react";

export function TurnActions() {
  const { game, isMyTurn, aiProcessing, lastDiceRoll, rollDice, buyProperty, skipBuy, upgradeProperty, mortgageProperty, payJailBail, endTurn, canUpgrade } = useGame();
  const [diceRolling, setDiceRolling] = useState(false);

  const handleRoll = () => {
    setDiceRolling(true);
    setTimeout(() => {
      rollDice();
      setDiceRolling(false);
    }, 700);
  };

  if (aiProcessing) {
    const aiPlayer = game.players[game.currentTurn];
    const personality = aiPlayer?.aiPersonality;
    return (
      <div className="text-center flex flex-col items-center gap-2">
        <div className="text-3xl">{personality && (() => { const Icon = AI_PERSONALITIES[personality].icon; return <Icon size={32} style={{ color: AI_PERSONALITIES[personality].color }} />; })()}</div>
        <div className="text-[var(--text-dim)]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
          {personality && AI_PERSONALITIES[personality].name}
        </div>
        <div className="flex flex-col gap-1.5 items-center">
          <div className="ai-skeleton-bar w-32" />
          <div className="ai-skeleton-bar w-20" />
        </div>
      </div>
    );
  }

  if (!isMyTurn) return <div className="text-center text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>WAITING...</div>;

  const player = game.players[0];
  const pos = player.position;
  const space = BOARD_SPACES[pos];
  const isUnownedProperty = game.hasRolled && space.spaceType === "property" && !game.propertyOwners.has(pos);
  const canBuy = isUnownedProperty && player.balance >= space.basePrice;
  const inJail = player.jailTurns > 0;

  const upgradeableProps = player.propertiesOwned.filter((idx) => canUpgrade(idx));

  const mortgageableProps = player.propertiesOwned.filter((idx) =>
    !player.mortgagedProperties.includes(idx) && (game.propertyLevels.get(idx) || 0) === 0
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Animated dice */}
      {diceRolling && (
        <AnimatedDice values={[1, 1]} rolling={true} />
      )}
      {!diceRolling && lastDiceRoll && game.hasRolled && (
        <AnimatedDice values={lastDiceRoll} rolling={false} />
      )}

      {/* Jail options */}
      {inJail && !game.hasRolled && (() => {
        const bailCost = Math.ceil((JAIL_BAIL / JAIL_DURATION) * player.jailTurns);
        const turnWord = player.jailTurns === 1 ? "turn" : "turns";
        return (
          <div className="flex flex-col items-center gap-2">
            <div className="text-[var(--red)]" style={{ fontSize: "var(--text-sm)" }}>
              <span className="inline-flex items-center gap-1"><Lock size={14} /> You&apos;re in MEV Jail ({player.jailTurns} {turnWord} left)</span>
            </div>
            <div className="flex gap-2">
              {player.balance >= bailCost && (
                <button onClick={payJailBail} className="btn px-5 py-2 bg-[var(--amber)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110" style={{ fontSize: "var(--text-sm)" }}>
                  Pay {bailCost} OCT Bail
                </button>
              )}
              <button onClick={endTurn} className="btn px-5 py-2 border border-[var(--border)] text-[var(--text-dim)] rounded-[var(--r-sharp)] hover:border-[var(--border-hover)] hover:text-[var(--text)]" style={{ fontSize: "var(--text-sm)" }}>
                Wait ({player.jailTurns} {turnWord})
              </button>
            </div>
          </div>
        );
      })()}

      {/* Roll dice — HERO action */}
      {!game.hasRolled && !inJail && !diceRolling && (
        <button onClick={handleRoll} className="btn px-10 py-3 bg-[var(--coral)] text-[var(--white)] rounded-[var(--r-sharp)] font-semibold uppercase tracking-[2px] hover:brightness-110 shadow-[var(--shadow-elevated)]" style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-sm)" }}>
          Roll Dice
        </button>
      )}

      {/* Post-roll actions */}
      {game.hasRolled && (
        <>
          <div className="text-[var(--text-dim)]" style={{ fontSize: "var(--text-sm)" }}>
            Landed on <strong className="text-[var(--text)]" style={{ fontFamily: "var(--font-heading)" }}>{space.name}</strong>
          </div>

          {isUnownedProperty && (
            <div className="flex gap-2">
              {canBuy && (
                <button onClick={buyProperty} className="btn px-5 py-2 bg-[var(--teal)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110" style={{ fontSize: "var(--text-sm)" }}>
                  BUY (<span className="tabular-nums">{space.basePrice}</span> OCT)
                </button>
              )}
              <button onClick={skipBuy} className="btn px-5 py-2 bg-[var(--amber)] text-[var(--navy)] rounded-[var(--r-sharp)] font-semibold hover:brightness-110" style={{ fontSize: "var(--text-sm)" }}>
                AUCTION
              </button>
            </div>
          )}

          {/* Upgrade (only if full color set) */}
          {upgradeableProps.length > 0 && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[var(--text-dim)] uppercase tracking-[1px]" style={{ fontSize: "var(--text-xs)" }}>Upgrade (full set owned)</span>
              <div className="flex gap-1 flex-wrap justify-center max-w-[350px]">
                {upgradeableProps.map((idx) => {
                  const lvl = game.propertyLevels.get(idx) || 0;
                  const cost = BOARD_SPACES[idx].upgradePrices[lvl];
                  return (
                    <button key={idx} onClick={() => upgradeProperty(idx)} className="btn px-2.5 py-1.5 border border-[var(--amber)] text-[var(--amber)] rounded-[var(--r-sharp)] hover:bg-[var(--amber)] hover:text-[var(--navy)]" style={{ fontSize: "var(--text-xs)" }}>
                      {BOARD_SPACES[idx].name} (<span className="tabular-nums">{cost}</span>)
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mortgage */}
          {mortgageableProps.length > 0 && player.balance < 300 && (
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[var(--text-dim)] uppercase tracking-[1px]" style={{ fontSize: "var(--text-xs)" }}>Mortgage (50% value)</span>
              <div className="flex gap-1 flex-wrap justify-center max-w-[350px]">
                {mortgageableProps.map((idx) => {
                  const val = Math.floor(BOARD_SPACES[idx].basePrice * MORTGAGE_RATE);
                  return (
                    <button key={idx} onClick={() => mortgageProperty(idx)} className="btn px-2.5 py-1.5 border border-[var(--red)] text-[var(--red)] rounded-[var(--r-sharp)] hover:bg-[var(--red)] hover:text-[var(--white)]" style={{ fontSize: "var(--text-xs)" }}>
                      {BOARD_SPACES[idx].name} (+{val})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button onClick={endTurn} className="btn px-6 py-1.5 border border-[var(--border)] text-[var(--text-dim)] rounded-[var(--r-sharp)] hover:border-[var(--border-hover)] hover:text-[var(--text)]" style={{ fontSize: "var(--text-xs)" }}>
            END TURN
          </button>
        </>
      )}
    </div>
  );
}
