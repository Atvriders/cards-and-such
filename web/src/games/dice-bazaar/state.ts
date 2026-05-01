import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TURNS = 10;
export const GOODS = ["silk", "spice", "gem"] as const;
export type Good = typeof GOODS[number];

export interface DiceBazaarSettings { dummy: boolean; }

export interface DiceBazaarState {
  rngSeed: number;
  turn: number;
  prices: Record<Good, number>;
  inventory: Record<Good, number>;
  gold: number;
  rolls: [number, number] | null;
  score: number;
  phase: "market" | "result" | "done";
  log: string;
}

export type DiceBazaarAction = { type: "buy"; good: Good } | { type: "sell"; good: Good } | { type: "next" };

function rollPrices(rng: () => number): Record<Good, number> {
  return { silk: 2 + Math.floor(rng() * 6), spice: 3 + Math.floor(rng() * 7), gem: 6 + Math.floor(rng() * 12) };
}

export function initialState(seed: number, _settings: DiceBazaarSettings): DiceBazaarState {
  const rng = mulberry32(seed);
  const prices = rollPrices(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, turn: 1, prices, inventory: { silk: 0, spice: 0, gem: 0 }, gold: 12, rolls: null, score: 0, phase: "market", log: "" };
}

export function reducer(state: DiceBazaarState, action: DiceBazaarAction): DiceBazaarState {
  if (state.phase === "done") return state;
  if (action.type === "buy" && state.phase === "market") {
    const p = state.prices[action.good];
    if (state.gold < p) return state;
    return { ...state, gold: state.gold - p, inventory: { ...state.inventory, [action.good]: state.inventory[action.good] + 1 }, log: `Bought ${action.good} for ${p}.` };
  }
  if (action.type === "sell" && state.phase === "market") {
    if (state.inventory[action.good] <= 0) return state;
    const p = state.prices[action.good];
    return { ...state, gold: state.gold + p, inventory: { ...state.inventory, [action.good]: state.inventory[action.good] - 1 }, score: state.score + p, log: `Sold ${action.good} for ${p}.` };
  }
  if (action.type === "next" && state.phase === "market") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const newPrices = rollPrices(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const turn = state.turn + 1;
    let phase: DiceBazaarState["phase"] = turn > TURNS ? "done" : "market";
    let score = state.score;
    let log = `Day passes. New prices.`;
    if (phase === "done") {
      score += state.gold;
      log = `Final ledger: gold ${state.gold} added.`;
    }
    return { ...state, rngSeed: nextSeed, prices: newPrices, turn, phase, rolls: [r1, r2], score, log };
  }
  return state;
}

export function isTerminal(state: DiceBazaarState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
