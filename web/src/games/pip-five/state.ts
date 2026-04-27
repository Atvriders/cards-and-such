import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pip Five: 8 rounds. Each round, deal 5 cards. Sum their pips (using "small pip" values).
// Aim for sum closest to 25. Score = max(0, 30 - |sum - 25|*2).

export const TOTAL_ROUNDS = 8;
export const TARGET = 25;

export interface PipFiveSettings { dummy: boolean; }

export interface PipFiveState {
  rngSeed: number;
  round: number;
  hand: number[];
  sum: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}

export type PipFiveAction = { type: "deal" } | { type: "next" };

export function pipValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 10; // J
  if (r === 10) return 10; // Q
  if (r === 11) return 10; // K
  return 1; // A
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal5(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: PipFiveSettings): PipFiveState {
  return { rngSeed: seed, round: 1, hand: [], sum: 0, score: 0, phase: "dealing", lastPts: 0 };
}

export function reducer(state: PipFiveState, action: PipFiveAction): PipFiveState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = hand.reduce((a, b) => a + pipValue(b), 0);
    const distance = Math.abs(sum - TARGET);
    const pts = Math.max(0, 30 - distance * 2);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, sum, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], sum: 0, phase: "dealing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: PipFiveState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
