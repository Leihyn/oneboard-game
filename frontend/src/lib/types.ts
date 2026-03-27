import { Dices, ShieldCheck, Bot, type LucideIcon } from "lucide-react";

// === Game State Types ===

export type SpaceType = "property" | "chance" | "tax" | "start" | "jail" | "rug_pull" | "airdrop" | "governance" | "railroad";
export type PropertyCategory = "yield_farm" | "lp" | "dex" | "lending" | "staking";
export type AIPersonality = "degen" | "whale" | "mev_bot";
export type AIDifficulty = "easy" | "normal" | "hard";
export type GameStatus = "lobby" | "active" | "finished";

export interface Space {
  index: number;
  spaceType: SpaceType;
  name: string;
  category: PropertyCategory | null;
  basePrice: number;
  baseRent: number;
  upgradePrices: [number, number];
  rentMultipliers: [number, number];
}

export interface PlayerState {
  addr: string;
  balance: number;
  position: number;
  isBankrupt: boolean;
  isAi: boolean;
  aiPersonality: AIPersonality | null;
  jailTurns: number;
  propertiesOwned: number[];
  mortgagedProperties: number[];
}

export interface GameState {
  id: string;
  players: PlayerState[];
  currentTurn: number;
  turnNumber: number;
  status: GameStatus;
  winner: string | null;
  hasRolled: boolean;
  lastRoll: [number, number]; // two dice
  doublesCount: number;
  propertyOwners: Map<number, number>;
  propertyLevels: Map<number, number>;
  auctionInProgress: AuctionState | null;
  difficulty: AIDifficulty;
}

export interface AuctionState {
  spaceIndex: number;
  currentBid: number;
  currentBidder: number;
  biddersRemaining: number[];
}

export interface AIDecisionResponse {
  action: "buy" | "skip" | "upgrade";
  upgradeTarget: number | null;
  trashTalk: string;
}

// === Board Layout (16 spaces) ===

export const BOARD_SIZE = 16;

export const BOARD_SPACES: Space[] = [
  // Top row
  { index: 0, spaceType: "start", name: "Genesis Block", category: null, basePrice: 0, baseRent: 0, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 1, spaceType: "property", name: "OnePlay", category: "yield_farm", basePrice: 600, baseRent: 60, upgradePrices: [300, 600], rentMultipliers: [25000, 60000] },
  { index: 2, spaceType: "airdrop", name: "OCT Airdrop", category: null, basePrice: 0, baseRent: 0, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 3, spaceType: "property", name: "OneRWA", category: "lending", basePrice: 800, baseRent: 80, upgradePrices: [400, 800], rentMultipliers: [25000, 60000] },
  { index: 4, spaceType: "property", name: "OneDEX", category: "dex", basePrice: 1000, baseRent: 100, upgradePrices: [500, 1000], rentMultipliers: [25000, 60000] },
  // Right column
  { index: 5, spaceType: "tax", name: "Gas Tax", category: null, basePrice: 0, baseRent: 200, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 6, spaceType: "property", name: "OCT Staking", category: "staking", basePrice: 900, baseRent: 90, upgradePrices: [450, 900], rentMultipliers: [25000, 60000] },
  { index: 7, spaceType: "property", name: "OneDEX LP", category: "lp", basePrice: 700, baseRent: 70, upgradePrices: [350, 700], rentMultipliers: [25000, 60000] },
  // Bottom row
  { index: 8, spaceType: "jail", name: "MEV Jail", category: null, basePrice: 0, baseRent: 0, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 9, spaceType: "property", name: "USDO Vault", category: "lending", basePrice: 1100, baseRent: 110, upgradePrices: [550, 1100], rentMultipliers: [25000, 60000] },
  { index: 10, spaceType: "rug_pull", name: "Rug Pull", category: null, basePrice: 0, baseRent: 0, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 11, spaceType: "property", name: "OneTransfer", category: "lp", basePrice: 850, baseRent: 85, upgradePrices: [425, 850], rentMultipliers: [25000, 60000] },
  { index: 12, spaceType: "property", name: "OnePredict", category: "staking", basePrice: 1200, baseRent: 120, upgradePrices: [600, 1200], rentMultipliers: [25000, 60000] },
  // Left column
  { index: 13, spaceType: "governance", name: "DAO Vote", category: null, basePrice: 0, baseRent: 0, upgradePrices: [0, 0], rentMultipliers: [0, 0] },
  { index: 14, spaceType: "property", name: "OnePoker", category: "dex", basePrice: 750, baseRent: 75, upgradePrices: [375, 750], rentMultipliers: [25000, 60000] },
  { index: 15, spaceType: "property", name: "OneNFT", category: "yield_farm", basePrice: 650, baseRent: 65, upgradePrices: [325, 650], rentMultipliers: [25000, 60000] },
];

// === Color Set Helpers ===

// Properties grouped by category — must own all to upgrade
export const COLOR_SETS: Record<PropertyCategory, number[]> = {
  yield_farm: [1, 15],  // OnePlay, OneNFT
  lending: [3, 9],      // OneRWA, USDO Vault
  dex: [4, 14],         // OneDEX, OnePoker
  staking: [6, 12],     // OCT Staking, OnePredict
  lp: [7, 11],          // OneDEX LP, OneTransfer
};

export function ownsFullSet(playerIndex: number, category: PropertyCategory, propertyOwners: Map<number, number>): boolean {
  const set = COLOR_SETS[category];
  return set.every((idx) => propertyOwners.get(idx) === playerIndex);
}

// === Constants ===

export const JAIL_BAIL = 500;
export const MORTGAGE_RATE = 0.5; // sell back at 50%

export const AI_PERSONALITIES: Record<AIPersonality, { name: string; emoji: string; icon: LucideIcon; color: string }> = {
  degen: { name: "Degen Trader", emoji: "🎰", icon: Dices, color: "#ef4444" },
  whale: { name: "Conservative Whale", emoji: "🐋", icon: ShieldCheck, color: "#3b82f6" },
  mev_bot: { name: "MEV Bot", emoji: "🤖", icon: Bot, color: "#10b981" },
};

export const CATEGORY_LABELS: Record<PropertyCategory, { name: string; levels: [string, string, string] }> = {
  yield_farm: { name: "Gaming", levels: ["Basic Games", "Play-to-Earn", "Full GameFi"] },
  lp: { name: "Liquidity", levels: ["Basic LP", "Concentrated", "Protocol-owned"] },
  dex: { name: "Exchange", levels: ["AMM", "Hybrid", "Full Orderbook"] },
  lending: { name: "Finance", levels: ["Basic Vault", "Yield Bearing", "Leveraged"] },
  staking: { name: "Staking", levels: ["Delegated", "Liquid", "Restaking"] },
};

export const DIFFICULTY_LABELS: Record<AIDifficulty, { name: string; description: string }> = {
  easy: { name: "Easy", description: "AI makes random decisions, often skips buying" },
  normal: { name: "Normal", description: "AI uses personality-based strategy" },
  hard: { name: "Hard", description: "AI calculates optimal moves, aggressive upgrades" },
};
