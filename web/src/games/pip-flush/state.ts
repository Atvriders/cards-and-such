import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pip Flush: 8 rounds. Deal 5 cards. Each card same-suit pair scores points; all 5 same suit = jackpot.
// Score: largest same-suit-group size N: pts = N*5; if N==5 (flush) += 60.

export const TOTAL_ROUNDS = 8;

export interface PipFlushSettings { dummy: boolean; }

export interface PipFlushState {
  rngSeed: number;
  round: number;
  hand: number[];
  bestSuitCount: number;
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
  flush: boolean;
}

export type PipFlushAction = { type: "deal" } | { type: "next" };

export function suitOf(c: number): number { return Math.floor(c / 13); }
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

export function initialState(seed: number, _settings: PipFlushSettings): PipFlushState {
  return { rngSeed: seed, round: 1, hand: [], bestSuitCount: 0, score: 0, phase: "dealing", lastPts: 0, flush: false };
}

export function reducer(state: PipFlushState, action: PipFlushAction): PipFlushState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const counts: Record<number, number> = {};
    for (const c of hand) { const s = suitOf(c); counts[s] = (counts[s] || 0) + 1; }
    const bestSuitCount = Math.max(...Object.values(counts));
    const flush = bestSuitCount === 5;
    let pts = bestSuitCount * 5;
    if (flush) pts += 60;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, bestSuitCount, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts, flush };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], bestSuitCount: 0, phase: "dealing", lastPts: 0, flush: false };
  }
  return state;
}

export function isTerminal(state: PipFlushState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
