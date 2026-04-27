import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// High Pair: Each round, deal 2 cards. If they form a pair, award (rank - 1) points.
// 8 rounds. A pair of Aces (rank 14) -> 13 points; deuces -> 1 point.

export const TOTAL_ROUNDS = 8;

export interface HighPairSettings { dummy: boolean; }

export interface HighPairState {
  rngSeed: number;
  round: number;
  hand: number[];
  ranks: number[];
  isPair: boolean;
  pts: number;
  score: number;
  phase: "dealing" | "scored" | "done";
}

export type HighPairAction = { type: "deal" } | { type: "next" };

export function rankOf(c: number): number { return (c % 13) + 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal2(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 2) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: HighPairSettings): HighPairState {
  return { rngSeed: seed, round: 1, hand: [], ranks: [], isPair: false, pts: 0, score: 0, phase: "dealing" };
}

export function reducer(state: HighPairState, action: HighPairAction): HighPairState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal2(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ranks = hand.map(rankOf);
    const isPair = ranks[0] === ranks[1];
    const pts = isPair ? Math.max(0, ranks[0]! - 1) : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, ranks, isPair, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], ranks: [], isPair: false, pts: 0, phase: "dealing" };
  }
  return state;
}

export function isTerminal(state: HighPairState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
