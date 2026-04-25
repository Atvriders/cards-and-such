import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AuctionSettings {
  rounds: "5" | "10" | "15";
}

export interface AuctionItem {
  name: string;
  trueValue: number;
  currentBid: number;
  won: boolean;
  winner: "player" | "ai" | "none";
}

export interface AuctionState {
  settings: AuctionSettings;
  rng: () => number;
  round: number;
  totalRounds: number;
  playerMoney: number;
  aiMoney: number;
  item: AuctionItem;
  playerBid: number;
  phase: "bid" | "result" | "over";
  score: number;
  log: string;
}

export type AuctionAction =
  | { type: "raise"; amount: number }
  | { type: "pass" }
  | { type: "next" };

const ITEMS = [
  "Vintage Watch", "Rare Painting", "Antique Vase", "Gem Necklace",
  "Old Coin Set", "Signed Baseball", "Sculpture", "Pearl Ring",
  "Silver Trophy", "First-Edition Book", "Engraved Sword", "Ruby Brooch",
  "Chess Set", "Ivory Fan", "Tapestry", "Diamond Pin",
];

function generateItem(rng: () => number): AuctionItem {
  const name = ITEMS[Math.floor(rng() * ITEMS.length)]!;
  const trueValue = 50 + Math.floor(rng() * 450); // 50-500
  return { name, trueValue, currentBid: 10, won: false, winner: "none" };
}

export function initialState(seed: number, settings: AuctionSettings): AuctionState {
  const rng = mulberry32(seed);
  const totalRounds = parseInt(settings.rounds);
  const item = generateItem(rng);
  return {
    settings,
    rng,
    round: 1,
    totalRounds,
    playerMoney: 1000,
    aiMoney: 1000,
    item,
    playerBid: 0,
    phase: "bid",
    score: 0,
    log: `Round 1: ${item.name} is up for auction! True value: $${item.trueValue}. Starting bid: $${item.currentBid}.`,
  };
}

export function reducer(state: AuctionState, action: AuctionAction): AuctionState {
  if (state.phase === "over") return state;

  if (action.type === "raise") {
    const newBid = state.item.currentBid + action.amount;
    if (newBid > state.playerMoney) {
      return { ...state, log: "You can't afford that bid!" };
    }
    // AI decides: if item worth more, AI raises further; else AI concedes
    const aiBid = state.item.trueValue > newBid && state.aiMoney > newBid + 10
      ? newBid + Math.floor(state.rng() * 20 + 5)
      : 0;

    if (aiBid === 0 || aiBid > state.aiMoney) {
      // Player wins
      const profit = state.item.trueValue - newBid;
      const playerMoney = state.playerMoney - newBid + state.item.trueValue;
      const item = { ...state.item, currentBid: newBid, won: true, winner: "player" as const };
      return {
        ...state,
        item,
        playerBid: newBid,
        playerMoney,
        phase: "result",
        log: `You won ${state.item.name} for $${newBid}! True value was $${state.item.trueValue}. ${profit >= 0 ? `Profit: $${profit}` : `Loss: $${-profit}`}.`,
      };
    } else {
      // AI raises
      const item = { ...state.item, currentBid: aiBid };
      return {
        ...state,
        item,
        log: `You bid $${newBid}. AI raises to $${aiBid}. Your budget: $${state.playerMoney}.`,
      };
    }
  }

  if (action.type === "pass") {
    // AI wins the item
    const aiCost = state.item.currentBid;
    const aiMoney = state.aiMoney - aiCost + state.item.trueValue;
    const item = { ...state.item, won: true, winner: "ai" as const };
    return {
      ...state,
      item,
      aiMoney,
      phase: "result",
      log: `You passed. AI bought ${state.item.name} for $${aiCost} (value $${state.item.trueValue}). AI profit: $${state.item.trueValue - aiCost}.`,
    };
  }

  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const nextRound = state.round + 1;
    if (nextRound > state.totalRounds) {
      const score = state.playerMoney;
      return { ...state, phase: "over", score, log: `Auction over! Final balance: $${state.playerMoney}. Score: ${score}.` };
    }
    const item = generateItem(state.rng);
    return {
      ...state,
      round: nextRound,
      item,
      playerBid: 0,
      phase: "bid",
      log: `Round ${nextRound}: ${item.name} up for auction! True value: $${item.trueValue}. Starting bid: $${item.currentBid}.`,
    };
  }

  return state;
}

export function isTerminal(state: AuctionState): { score: number } | null {
  if (state.phase === "over") return { score: state.score };
  return null;
}
