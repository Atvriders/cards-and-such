import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pip Ten: 8 rounds. Each round, deal 10 cards. Sum their pips. Target is 50. Closest scores points.

export const TOTAL_ROUNDS = 8;
export const TARGET = 50;
export const HAND_SIZE = 10;

export interface PipTenSettings { dummy: boolean; }

export interface PipTenState {
  rngSeed: number;
  round: number;
  hand: number[];
  sum: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}

export type PipTenAction = { type: "deal" } | { type: "next" };

export function pipValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 10;
  if (r === 10) return 10;
  if (r === 11) return 10;
  return 1;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function dealN(rng: () => number, n: number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < n) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: PipTenSettings): PipTenState {
  return { rngSeed: seed, round: 1, hand: [], sum: 0, score: 0, phase: "dealing", lastPts: 0 };
}

export function reducer(state: PipTenState, action: PipTenAction): PipTenState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealN(rng, HAND_SIZE);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = hand.reduce((a, b) => a + pipValue(b), 0);
    const distance = Math.abs(sum - TARGET);
    const pts = Math.max(0, 40 - distance * 2);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, sum, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], sum: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: PipTenState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
