import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Trade Up: 12 trades. You have a current card; a candidate is dealt. You can KEEP
// (no change, no score) or TRADE (replace your card with the candidate). +5 if rank goes up,
// -5 if rank goes down, 0 if equal. Goal: net positive.

export const TOTAL_TRADES = 12;

export interface CardTradeUpSettings { dummy: boolean; }

export interface CardTradeUpState {
  rngSeed: number;
  trade: number;
  current: number; // current card
  candidate: number; // dealt candidate
  score: number;
  phase: "deciding" | "done";
  lastDelta: number;
}

export type CardTradeUpAction = { type: "trade" } | { type: "keep" };

export function rankOf(c: number): number { return c % 13; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function drawCard(rng: () => number): number { return Math.floor(rng() * 52); }

export function initialState(seed: number, _s: CardTradeUpSettings): CardTradeUpState {
  const rng = mulberry32(seed);
  const current = drawCard(rng);
  const candidate = drawCard(rng);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    trade: 1,
    current,
    candidate,
    score: 0,
    phase: "deciding",
    lastDelta: 0,
  };
}

export function reducer(state: CardTradeUpState, action: CardTradeUpAction): CardTradeUpState {
  if (state.phase === "done") return state;
  let newCurrent = state.current;
  let delta = 0;
  if (action.type === "trade") {
    const oldR = rankOf(state.current);
    const newR = rankOf(state.candidate);
    delta = newR > oldR ? 5 : newR < oldR ? -5 : 0;
    newCurrent = state.candidate;
  } else {
    delta = 0;
  }
  if (state.trade >= TOTAL_TRADES) {
    return { ...state, score: state.score + delta, lastDelta: delta, phase: "done" };
  }
  const rng = mulberry32(state.rngSeed);
  const candidate = drawCard(rng);
  return {
    ...state,
    rngSeed: Math.floor(rng() * 2 ** 31),
    trade: state.trade + 1,
    current: newCurrent,
    candidate,
    score: state.score + delta,
    lastDelta: delta,
  };
}

export function isTerminal(state: CardTradeUpState): { score: number } | null {
  return state.phase === "done" ? { score: Math.max(0, state.score) } : null;
}
