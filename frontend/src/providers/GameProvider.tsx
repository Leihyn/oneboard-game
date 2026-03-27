"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { GameState, PlayerState, BOARD_SPACES, BOARD_SIZE, AIPersonality, AIDifficulty, CATEGORY_LABELS, ownsFullSet, JAIL_BAIL, MORTGAGE_RATE } from "@/lib/types";
import { STARTING_BALANCE, TAX_AMOUNT, CHANCE_BONUS, START_PASS_BONUS, JAIL_DURATION, RUG_PULL_LOSS_PERCENT, AIRDROP_BONUS, GOVERNANCE_BONUS, AUCTION_MIN_BID } from "@/lib/constants";
import { useToast } from "@/components/game/Toast";

export interface GameLog {
  id: number;
  turn: number;
  playerIndex: number;
  playerName: string;
  message: string;
  type: "roll" | "buy" | "rent" | "tax" | "chance" | "jail" | "upgrade" | "bankrupt" | "system" | "trash_talk" | "auction" | "rug_pull" | "airdrop" | "governance" | "mortgage" | "jail_bail";
}

interface GameContextType {
  game: GameState;
  logs: GameLog[];
  lastDiceRoll: [number, number] | null;
  aiProcessing: boolean;
  highlightedSpace: number | null;
  rollDice: () => void;
  buyProperty: () => void;
  skipBuy: () => void;
  upgradeProperty: (spaceIndex: number) => void;
  mortgageProperty: (spaceIndex: number) => void;
  payJailBail: () => void;
  endTurn: () => void;
  isMyTurn: boolean;
  currentPlayerName: string;
  canUpgrade: (spaceIndex: number) => boolean;
}

const GameContext = createContext<GameContextType | null>(null);
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

function getPlayerName(p: PlayerState): string {
  if (!p.isAi) return "You";
  if (p.aiPersonality === "degen") return "Degen";
  if (p.aiPersonality === "whale") return "Whale";
  return "MEV Bot";
}

function cloneGame(g: GameState): GameState {
  const next = structuredClone(g);
  next.propertyOwners = new Map(g.propertyOwners);
  next.propertyLevels = new Map(g.propertyLevels);
  return next;
}

function rollTwoDice(): [number, number] {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function calculateRent(spaceIndex: number, level: number, propertyOwners: Map<number, number>, ownerIndex: number): number {
  const space = BOARD_SPACES[spaceIndex];
  let rent = space.baseRent;
  if (level === 1) rent = Math.floor(space.baseRent * space.rentMultipliers[0] / 10000);
  if (level === 2) rent = Math.floor(space.baseRent * space.rentMultipliers[1] / 10000);
  // Double rent if owner has full color set but no upgrades
  if (level === 0 && space.category && ownsFullSet(ownerIndex, space.category, propertyOwners)) {
    rent *= 2;
  }
  return rent;
}

function transferPropertiesToCreditor(game: GameState, bankruptIndex: number, creditorIndex: number) {
  const bankrupt = game.players[bankruptIndex];
  for (const propIdx of bankrupt.propertiesOwned) {
    game.propertyOwners.set(propIdx, creditorIndex);
    game.players[creditorIndex].propertiesOwned.push(propIdx);
  }
  bankrupt.propertiesOwned = [];
}

function createInitialState(playerAddress: string, difficulty: AIDifficulty): GameState {
  return {
    id: "local-game",
    players: [
      { addr: playerAddress, balance: STARTING_BALANCE, position: 0, isBankrupt: false, isAi: false, aiPersonality: null, jailTurns: 0, propertiesOwned: [], mortgagedProperties: [] },
      { addr: "ai-degen", balance: STARTING_BALANCE, position: 0, isBankrupt: false, isAi: true, aiPersonality: "degen", jailTurns: 0, propertiesOwned: [], mortgagedProperties: [] },
      { addr: "ai-whale", balance: STARTING_BALANCE, position: 0, isBankrupt: false, isAi: true, aiPersonality: "whale", jailTurns: 0, propertiesOwned: [], mortgagedProperties: [] },
      { addr: "ai-mev-bot", balance: STARTING_BALANCE, position: 0, isBankrupt: false, isAi: true, aiPersonality: "mev_bot", jailTurns: 0, propertiesOwned: [], mortgagedProperties: [] },
    ],
    currentTurn: 0, turnNumber: 0, status: "active", winner: null, hasRolled: false,
    lastRoll: [0, 0], doublesCount: 0,
    propertyOwners: new Map(), propertyLevels: new Map(), auctionInProgress: null,
    difficulty,
  };
}

export function GameProvider({ gameId, playerAddress, difficulty = "normal", children }: { gameId: string; playerAddress: string; difficulty?: AIDifficulty; children: ReactNode }) {
  const [game, setGame] = useState<GameState>(() => createInitialState(playerAddress, difficulty));
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [lastDiceRoll, setLastDiceRoll] = useState<[number, number] | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [highlightedSpace, setHighlightedSpace] = useState<number | null>(null);
  const logIdRef = useRef(0);
  const { toast } = useToast();

  const addLog = useCallback((playerIndex: number, playerName: string, message: string, type: GameLog["type"], turnNum: number) => {
    const log: GameLog = { id: logIdRef.current++, turn: turnNum, playerIndex, playerName, message, type };
    setLogs((prev) => {
      // Dedup: skip if last log has same player, message, and turn
      const last = prev[prev.length - 1];
      if (last && last.playerIndex === playerIndex && last.message === message && last.turn === turnNum) return prev;
      return [...prev, log].slice(-100);
    });
  }, []);

  const highlightSpace = useCallback((spaceIndex: number) => {
    setHighlightedSpace(spaceIndex);
    setTimeout(() => setHighlightedSpace(null), 3000);
  }, []);

  const canUpgrade = useCallback((spaceIndex: number): boolean => {
    const space = BOARD_SPACES[spaceIndex];
    if (!space.category) return false;
    const level = game.propertyLevels.get(spaceIndex) || 0;
    if (level >= 2) return false;
    const ownerIdx = game.propertyOwners.get(spaceIndex);
    if (ownerIdx !== game.currentTurn) return false;
    // Must own full color set
    if (!ownsFullSet(game.currentTurn, space.category, game.propertyOwners)) return false;
    const cost = space.upgradePrices[level];
    return game.players[game.currentTurn].balance >= cost;
  }, [game]);

  // === HUMAN ACTIONS ===

  const rollDice = useCallback(() => {
    const [d1, d2] = rollTwoDice();
    const roll = d1 + d2;
    const isDoubles = d1 === d2;
    setLastDiceRoll([d1, d2]);

    setGame((prev) => {
      if (prev.hasRolled || prev.status !== "active") return prev;
      const next = cloneGame(prev);
      const player = next.players[next.currentTurn];

      // Doubles 3x = go to jail
      next.lastRoll = [d1, d2];
      if (isDoubles) {
        next.doublesCount++;
        if (next.doublesCount >= 3) {
          player.position = 8; // MEV Jail
          player.jailTurns = JAIL_DURATION;
          next.hasRolled = true;
          next.doublesCount = 0;
          toast("3 doubles! Sent to MEV Jail!", "danger", "🔒");
          addLog(0, "You", "rolled 3 doubles — sent to MEV Jail!", "jail", next.turnNumber);
          return next;
        }
      } else {
        next.doublesCount = 0;
      }

      const oldPos = player.position;
      const newPos = (oldPos + roll) % BOARD_SIZE;

      if (newPos < oldPos && oldPos !== 0) {
        player.balance += START_PASS_BONUS;
        toast(`Passed Genesis! +${START_PASS_BONUS} OCT`, "success", "🚀");
      }
      player.position = newPos;
      next.hasRolled = true;

      const space = BOARD_SPACES[newPos];
      const rollText = `rolled ${d1}+${d2}=${roll}${isDoubles ? " (doubles!)" : ""}, moved to ${space.name}`;
      addLog(0, "You", rollText, "roll", next.turnNumber);
      highlightSpace(newPos);

      // Landing effects
      if (space.spaceType === "tax") {
        player.balance -= TAX_AMOUNT;
        if (player.balance <= 0) { player.balance = 0; player.isBankrupt = true; }
        toast(`Gas Tax! -${TAX_AMOUNT} OCT`, "danger", "💸");
        addLog(0, "You", `paid ${TAX_AMOUNT} OCT gas tax`, "tax", next.turnNumber);
      } else if (space.spaceType === "jail") {
        player.jailTurns = JAIL_DURATION;
        toast(`MEV Jail! Locked for ${JAIL_DURATION} turns`, "danger", "🔒");
        addLog(0, "You", "got caught by MEV Jail!", "jail", next.turnNumber);
      } else if (space.spaceType === "chance") {
        player.balance += CHANCE_BONUS;
        toast(`Flash Loan! +${CHANCE_BONUS} OCT`, "success", "⚡");
        addLog(0, "You", `executed a Flash Loan! +${CHANCE_BONUS} OCT`, "chance", next.turnNumber);
      } else if (space.spaceType === "airdrop") {
        player.balance += AIRDROP_BONUS;
        toast(`Airdrop! +${AIRDROP_BONUS} OCT`, "success", "🪂");
        addLog(0, "You", `received an Airdrop! +${AIRDROP_BONUS} OCT`, "airdrop", next.turnNumber);
      } else if (space.spaceType === "rug_pull") {
        const loss = Math.floor(player.balance * RUG_PULL_LOSS_PERCENT / 100);
        player.balance -= loss;
        if (player.balance <= 0) { player.balance = 0; player.isBankrupt = true; }
        toast(`RUG PULL! -${loss} OCT`, "danger", "🔻");
        addLog(0, "You", `got RUGGED! Lost ${loss} OCT`, "rug_pull", next.turnNumber);
      } else if (space.spaceType === "governance") {
        player.balance += GOVERNANCE_BONUS;
        toast(`DAO Vote! +${GOVERNANCE_BONUS} OCT`, "info", "🗳️");
        addLog(0, "You", `voted in the DAO! +${GOVERNANCE_BONUS} OCT`, "governance", next.turnNumber);
      } else if (space.spaceType === "property" && next.propertyOwners.has(newPos)) {
        const ownerIdx = next.propertyOwners.get(newPos)!;
        if (ownerIdx !== next.currentTurn && !next.players[ownerIdx].mortgagedProperties.includes(newPos)) {
          const level = next.propertyLevels.get(newPos) || 0;
          const rent = calculateRent(newPos, level, next.propertyOwners, ownerIdx);
          player.balance -= rent;
          const ownerName = getPlayerName(next.players[ownerIdx]);
          if (player.balance <= 0) {
            // Bankruptcy — transfer properties to creditor
            player.balance = 0;
            player.isBankrupt = true;
            transferPropertiesToCreditor(next, next.currentTurn, ownerIdx);
            toast(`Bankrupt! Properties go to ${ownerName}`, "danger", "💀");
            addLog(0, "You", `went bankrupt! Properties transferred to ${ownerName}`, "bankrupt", next.turnNumber);
          } else {
            next.players[ownerIdx].balance += rent;
            toast(`Paid ${rent} OCT rent to ${ownerName}`, "rent", "💰");
            addLog(0, "You", `paid ${rent} OCT rent to ${ownerName} for ${space.name}`, "rent", next.turnNumber);
          }
        }
      }

      const alive = next.players.filter((p) => !p.isBankrupt);
      if (alive.length <= 1) { next.status = "finished"; next.winner = alive[0]?.addr || null; }

      return next;
    });
  }, [toast, addLog, highlightSpace]);

  const buyProperty = useCallback(() => {
    setGame((prev) => {
      if (!prev.hasRolled) return prev;
      const next = cloneGame(prev);
      const player = next.players[next.currentTurn];
      const pos = player.position;
      const space = BOARD_SPACES[pos];
      if (space.spaceType !== "property" || next.propertyOwners.has(pos) || player.balance < space.basePrice) return prev;

      player.balance -= space.basePrice;
      player.propertiesOwned.push(pos);
      next.propertyOwners.set(pos, next.currentTurn);
      next.propertyLevels.set(pos, 0);

      const hasSet = space.category && ownsFullSet(next.currentTurn, space.category, next.propertyOwners);
      toast(`Bought ${space.name}!${hasSet ? " Full set — can upgrade!" : ""} NFT minted`, "nft", "🏠");
      addLog(0, "You", `bought ${space.name} for ${space.basePrice} OCT${hasSet ? " (FULL SET!)" : ""}`, "buy", next.turnNumber);
      return next;
    });
  }, [toast, addLog]);

  const skipBuy = useCallback(() => {
    setGame((prev) => {
      if (!prev.hasRolled) return prev;
      const next = cloneGame(prev);
      const pos = next.players[next.currentTurn].position;
      const space = BOARD_SPACES[pos];
      if (space.spaceType !== "property" || next.propertyOwners.has(pos)) return next;

      let currentBid = Math.floor(space.basePrice * 0.5);
      let winner = -1;

      for (let i = 1; i < next.players.length; i++) {
        if (next.players[i].isBankrupt) continue;
        const p = next.players[i];
        const aiName = getPlayerName(p);
        let bidAmount = currentBid + AUCTION_MIN_BID;
        let willBid = false;

        if (p.aiPersonality === "degen") { willBid = p.balance >= bidAmount; bidAmount = Math.min(p.balance, currentBid + 200); }
        else if (p.aiPersonality === "whale") { willBid = p.balance >= bidAmount * 3 && bidAmount <= space.basePrice; }
        else if (p.aiPersonality === "mev_bot") { willBid = bidAmount <= space.basePrice * 0.8 && p.balance >= bidAmount * 2; }

        if (willBid && bidAmount <= p.balance) {
          currentBid = bidAmount;
          winner = i;
          addLog(i, aiName, `bid ${bidAmount} OCT for ${space.name}`, "auction", next.turnNumber);
        }
      }

      if (winner >= 0) {
        const p = next.players[winner];
        p.balance -= currentBid;
        p.propertiesOwned.push(pos);
        next.propertyOwners.set(pos, winner);
        next.propertyLevels.set(pos, 0);
        toast(`${getPlayerName(p)} won ${space.name} at auction!`, "warning", "🔨");
        addLog(winner, getPlayerName(p), `won ${space.name} at auction for ${currentBid} OCT!`, "auction", next.turnNumber);
      } else {
        toast(`No bids for ${space.name}`, "info");
      }

      return next;
    });
  }, [toast, addLog]);

  const upgradeProperty = useCallback((spaceIndex: number) => {
    setGame((prev) => {
      if (!prev.hasRolled) return prev;
      const next = cloneGame(prev);
      const space = BOARD_SPACES[spaceIndex];
      if (!space.category) return prev;
      if (!ownsFullSet(next.currentTurn, space.category, next.propertyOwners)) return prev;

      const ownerIdx = next.propertyOwners.get(spaceIndex);
      if (ownerIdx !== next.currentTurn) return prev;
      const level = next.propertyLevels.get(spaceIndex) || 0;
      if (level >= 2) return prev;
      const cost = space.upgradePrices[level];
      const player = next.players[next.currentTurn];
      if (player.balance < cost) return prev;

      player.balance -= cost;
      const newLevel = level + 1;
      next.propertyLevels.set(spaceIndex, newLevel);

      const levelName = CATEGORY_LABELS[space.category].levels[newLevel];
      toast(`${space.name} upgraded to ${levelName}! NFT evolved`, "nft", "⬆️");
      addLog(0, "You", `upgraded ${space.name} to ${levelName} for ${cost} OCT`, "upgrade", next.turnNumber);
      return next;
    });
  }, [toast, addLog]);

  const mortgageProperty = useCallback((spaceIndex: number) => {
    setGame((prev) => {
      const next = cloneGame(prev);
      const player = next.players[next.currentTurn];
      const ownerIdx = next.propertyOwners.get(spaceIndex);
      if (ownerIdx !== next.currentTurn) return prev;
      if (player.mortgagedProperties.includes(spaceIndex)) return prev;

      const space = BOARD_SPACES[spaceIndex];
      const mortgageValue = Math.floor(space.basePrice * MORTGAGE_RATE);
      player.balance += mortgageValue;
      player.mortgagedProperties.push(spaceIndex);
      // Reset level
      next.propertyLevels.set(spaceIndex, 0);

      toast(`Mortgaged ${space.name} for ${mortgageValue} OCT`, "warning", "🏦");
      addLog(next.currentTurn, getPlayerName(player), `mortgaged ${space.name} for ${mortgageValue} OCT`, "mortgage", next.turnNumber);
      return next;
    });
  }, [toast, addLog]);

  const payJailBail = useCallback(() => {
    setGame((prev) => {
      const next = cloneGame(prev);
      const player = next.players[next.currentTurn];
      const bailCost = Math.ceil((JAIL_BAIL / JAIL_DURATION) * player.jailTurns);
      if (player.jailTurns <= 0 || player.balance < bailCost) return prev;

      player.balance -= bailCost;
      player.jailTurns = 0;

      toast(`Paid ${bailCost} OCT bail — free!`, "info", "\u{1F513}");
      addLog(next.currentTurn, getPlayerName(player), `paid ${bailCost} OCT bail to escape jail`, "jail_bail", next.turnNumber);
      return next;
    });
  }, [toast, addLog]);

  // === AI TURNS ===

  const processAITurnsSequential = useCallback(async (startGame: GameState) => {
    let current = cloneGame(startGame);
    const diff = current.difficulty;

    while (current.players[current.currentTurn].isAi && current.status === "active") {
      const aiPlayer = current.players[current.currentTurn];
      if (aiPlayer.isBankrupt) {
        let nextTurn = (current.currentTurn + 1) % current.players.length;
        while (current.players[nextTurn].isBankrupt) nextTurn = (nextTurn + 1) % current.players.length;
        if (current.players[nextTurn].jailTurns > 0) current.players[nextTurn].jailTurns--;
        current.currentTurn = nextTurn; current.turnNumber++; current.hasRolled = false;
        continue;
      }

      const aiName = getPlayerName(aiPlayer);
      const personality = aiPlayer.aiPersonality as AIPersonality;

      setGame(cloneGame(current));
      await delay(250);

      // Jail: pay bail or wait (bail is proportional to remaining turns)
      if (aiPlayer.jailTurns > 0) {
        const aiBailCost = Math.ceil((JAIL_BAIL / JAIL_DURATION) * aiPlayer.jailTurns);
        if (personality === "degen" && aiPlayer.balance >= aiBailCost) {
          aiPlayer.balance -= aiBailCost;
          aiPlayer.jailTurns = 0;
          addLog(current.currentTurn, aiName, `paid ${aiBailCost} OCT bail`, "jail_bail", current.turnNumber);
        } else if (personality === "whale" && aiPlayer.balance >= aiBailCost * 2) {
          aiPlayer.balance -= aiBailCost;
          aiPlayer.jailTurns = 0;
          addLog(current.currentTurn, aiName, `paid ${aiBailCost} OCT bail`, "jail_bail", current.turnNumber);
        }
        // If still jailed, skip turn
        if (aiPlayer.jailTurns > 0) {
          aiPlayer.jailTurns--;
          setGame(cloneGame(current));
          await delay(150);
          let nextTurn = (current.currentTurn + 1) % current.players.length;
          while (current.players[nextTurn].isBankrupt) nextTurn = (nextTurn + 1) % current.players.length;
          current.currentTurn = nextTurn; current.turnNumber++; current.hasRolled = false;
          continue;
        }
      }

      // Roll two dice
      const [d1, d2] = rollTwoDice();
      const roll = d1 + d2;
      const isDoubles = d1 === d2;
      const oldPos = aiPlayer.position;
      const newPos = (oldPos + roll) % BOARD_SIZE;
      if (newPos < oldPos && oldPos !== 0) aiPlayer.balance += START_PASS_BONUS;
      aiPlayer.position = newPos;
      current.hasRolled = true;

      setLastDiceRoll([d1, d2]);
      highlightSpace(newPos);
      addLog(current.currentTurn, aiName, `rolled ${d1}+${d2}=${roll}${isDoubles ? " (doubles!)" : ""}, moved to ${BOARD_SPACES[newPos].name}`, "roll", current.turnNumber);
      setGame(cloneGame(current));
      await delay(150);

      // Landing effects
      const space = BOARD_SPACES[newPos];
      if (space.spaceType === "tax") {
        aiPlayer.balance -= TAX_AMOUNT;
        if (aiPlayer.balance <= 0) { aiPlayer.balance = 0; aiPlayer.isBankrupt = true; }
        toast(`${aiName} paid Gas Tax!`, "danger", "💸");
      } else if (space.spaceType === "jail") {
        aiPlayer.jailTurns = JAIL_DURATION;
        toast(`${aiName} jailed!`, "danger", "🔒");
      } else if (space.spaceType === "chance") {
        aiPlayer.balance += CHANCE_BONUS;
      } else if (space.spaceType === "airdrop") {
        aiPlayer.balance += AIRDROP_BONUS;
      } else if (space.spaceType === "rug_pull") {
        const loss = Math.floor(aiPlayer.balance * RUG_PULL_LOSS_PERCENT / 100);
        aiPlayer.balance -= loss;
        if (aiPlayer.balance <= 0) { aiPlayer.balance = 0; aiPlayer.isBankrupt = true; }
        toast(`${aiName} got RUGGED! -${loss}`, "danger", "🔻");
      } else if (space.spaceType === "governance") {
        aiPlayer.balance += GOVERNANCE_BONUS;
      } else if (space.spaceType === "property" && current.propertyOwners.has(newPos)) {
        const ownerIdx = current.propertyOwners.get(newPos)!;
        if (ownerIdx !== current.currentTurn) {
          const level = current.propertyLevels.get(newPos) || 0;
          const rent = calculateRent(newPos, level, current.propertyOwners, ownerIdx);
          aiPlayer.balance -= rent;
          const ownerName = getPlayerName(current.players[ownerIdx]);
          if (aiPlayer.balance <= 0) {
            aiPlayer.balance = 0; aiPlayer.isBankrupt = true;
            transferPropertiesToCreditor(current, current.currentTurn, ownerIdx);
            addLog(current.currentTurn, aiName, `went bankrupt! Properties to ${ownerName}`, "bankrupt", current.turnNumber);
            toast(`${aiName} bankrupt! Properties to ${ownerName}`, "danger", "💀");
          } else {
            current.players[ownerIdx].balance += rent;
            if (ownerIdx === 0) toast(`${aiName} paid you ${rent} OCT rent!`, "success", "💰");
            addLog(current.currentTurn, aiName, `paid ${rent} OCT rent to ${ownerName}`, "rent", current.turnNumber);
          }
        }
      }

      setGame(cloneGame(current));
      const alive = current.players.filter((p) => !p.isBankrupt);
      if (alive.length <= 1) { current.status = "finished"; current.winner = alive[0]?.addr || null; setGame(cloneGame(current)); break; }
      if (aiPlayer.isBankrupt) { await delay(150); } else {
        // Buy decision
        if (space.spaceType === "property" && !current.propertyOwners.has(newPos)) {
          await delay(200);
          let shouldBuy = false;
          const buyFactor = diff === "easy" ? 0.3 : diff === "hard" ? 0.9 : 0.6;

          if (personality === "degen") shouldBuy = aiPlayer.balance >= space.basePrice && Math.random() < (diff === "easy" ? 0.5 : 1);
          else if (personality === "whale") shouldBuy = aiPlayer.balance >= space.basePrice * 2.5 * (1 / buyFactor);
          else if (personality === "mev_bot") shouldBuy = space.baseRent / space.basePrice >= 0.08 && aiPlayer.balance >= space.basePrice * 1.5;

          if (shouldBuy) {
            aiPlayer.balance -= space.basePrice;
            aiPlayer.propertiesOwned.push(newPos);
            current.propertyOwners.set(newPos, current.currentTurn);
            current.propertyLevels.set(newPos, 0);
            toast(`${aiName} bought ${space.name}!`, "warning", "🏠");
            addLog(current.currentTurn, aiName, `bought ${space.name} for ${space.basePrice} OCT`, "buy", current.turnNumber);
          }

          setGame(cloneGame(current));
          await delay(150);
        }

        // Upgrade decision (only if owns full set)
        if (!aiPlayer.isBankrupt && diff !== "easy") {
          for (const propIdx of aiPlayer.propertiesOwned) {
            const propSpace = BOARD_SPACES[propIdx];
            if (!propSpace.category) continue;
            if (!ownsFullSet(current.currentTurn, propSpace.category, current.propertyOwners)) continue;
            const lvl = current.propertyLevels.get(propIdx) || 0;
            if (lvl >= 2) continue;
            const cost = propSpace.upgradePrices[lvl];
            const affordCheck = personality === "degen" ? aiPlayer.balance >= cost : aiPlayer.balance >= cost * 2;
            if (affordCheck) {
              aiPlayer.balance -= cost;
              current.propertyLevels.set(propIdx, lvl + 1);
              addLog(current.currentTurn, aiName, `upgraded ${propSpace.name}`, "upgrade", current.turnNumber);
              setGame(cloneGame(current));
              break;
            }
          }
        }

        // Mortgage if low on cash (hard AI)
        if (diff === "hard" && aiPlayer.balance < 200 && aiPlayer.propertiesOwned.length > 2) {
          const worst = aiPlayer.propertiesOwned.find((idx) => (current.propertyLevels.get(idx) || 0) === 0 && !aiPlayer.mortgagedProperties.includes(idx));
          if (worst !== undefined) {
            const mortgageValue = Math.floor(BOARD_SPACES[worst].basePrice * MORTGAGE_RATE);
            aiPlayer.balance += mortgageValue;
            aiPlayer.mortgagedProperties.push(worst);
            addLog(current.currentTurn, aiName, `mortgaged ${BOARD_SPACES[worst].name}`, "mortgage", current.turnNumber);
          }
        }

        // AI trash talk via LLM (fire-and-forget — no blocking)
        const trashTalkPlayerIndex = current.currentTurn;
        const trashTalkTurn = current.turnNumber;
        fetch("/api/ai-turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personality,
            gameState: {
              playerBalance: aiPlayer.balance,
              playerPosition: newPos,
              spaceName: space.name,
              spaceType: space.spaceType,
              spacePrice: space.basePrice,
              spaceRent: space.baseRent,
              isOwned: current.propertyOwners.has(newPos),
              ownerName: current.propertyOwners.has(newPos) ? getPlayerName(current.players[current.propertyOwners.get(newPos)!]) : null,
              ownedProperties: aiPlayer.propertiesOwned.map((idx) => ({
                name: BOARD_SPACES[idx].name,
                level: current.propertyLevels.get(idx) || 0,
                spaceIndex: idx,
                upgradeCost: BOARD_SPACES[idx].upgradePrices[current.propertyLevels.get(idx) || 0] || 0,
              })),
              otherPlayers: current.players
                .filter((_, i) => i !== current.currentTurn && !current.players[i].isBankrupt)
                .map((p) => ({ name: getPlayerName(p), balance: p.balance, propertyCount: p.propertiesOwned.length })),
              turnNumber: current.turnNumber,
            },
          }),
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.trash_talk) {
              addLog(trashTalkPlayerIndex, aiName, data.trash_talk, "trash_talk", trashTalkTurn);
            }
          }
        }).catch(() => {});
      }

      // Advance
      let nextTurn = (current.currentTurn + 1) % current.players.length;
      while (current.players[nextTurn].isBankrupt) nextTurn = (nextTurn + 1) % current.players.length;
      if (current.players[nextTurn].jailTurns > 0 && !current.players[nextTurn].isAi) {} // don't auto-decrement for humans
      else if (current.players[nextTurn].jailTurns > 0 && current.players[nextTurn].isAi) {} // handled at start of their turn
      current.currentTurn = nextTurn; current.turnNumber++; current.hasRolled = false; current.doublesCount = 0;
    }

    return current;
  }, [toast, addLog, highlightSpace]);

  const endTurn = useCallback(async () => {
    const advanced = await new Promise<GameState>((resolve) => {
      setGame((prev) => {
        const player = prev.players[prev.currentTurn];
        const isJailed = player && player.jailTurns > 0;
        // Allow ending turn if rolled OR if in jail (waiting out sentence)
        if (!prev.hasRolled && !isJailed) { resolve(prev); return prev; }
        const next = cloneGame(prev);
        // If in jail and waiting, decrement jail turns
        if (isJailed && !prev.hasRolled) {
          next.players[next.currentTurn].jailTurns--;
          addLog(next.currentTurn, getPlayerName(next.players[next.currentTurn]), `waited in jail (${next.players[next.currentTurn].jailTurns} turns left)`, "jail", next.turnNumber);
        }
        const alive = next.players.filter((p) => !p.isBankrupt);
        if (alive.length <= 1) { next.status = "finished"; next.winner = alive[0]?.addr || null; resolve(next); return next; }

        let nextTurn = (next.currentTurn + 1) % next.players.length;
        while (next.players[nextTurn].isBankrupt) nextTurn = (nextTurn + 1) % next.players.length;
        next.currentTurn = nextTurn; next.turnNumber++; next.hasRolled = false; next.doublesCount = 0;
        resolve(next);
        return next;
      });
    });

    await delay(100);
    if (advanced.players[advanced.currentTurn]?.isAi && advanced.status === "active") {
      setAiProcessing(true);
      await delay(150);
      const finalState = await processAITurnsSequential(advanced);
      setGame(finalState);
      setAiProcessing(false);
    }
  }, [processAITurnsSequential]);

  const isMyTurn = game.currentTurn === 0 && game.status === "active" && !aiProcessing;
  const currentPlayerName = getPlayerName(game.players[game.currentTurn]);

  return (
    <GameContext.Provider value={{ game, logs, lastDiceRoll, aiProcessing, highlightedSpace, rollDice, buyProperty, skipBuy, upgradeProperty, mortgageProperty, payJailBail, endTurn, isMyTurn, currentPlayerName, canUpgrade }}>
      {children}
    </GameContext.Provider>
  );
}
