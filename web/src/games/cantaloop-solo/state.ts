import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CantaloopSoloSettings { rounds: "10"; }

export interface CantaloopSoloState {
  rngSeed: number;
  score: number;
  round: number;
  maxRounds: number;
  hand: number[];
  lastGain: number;
  phase: "ready" | "played" | "gameover";
}

export type CantaloopSoloAction = { type: "play" } | { type: "next" };

function deal5(seed: number): { hand: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const used = new Set<number>();
  const hand: number[] = [];
  while (hand.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); hand.push(c); }
  }
  return { hand, nextSeed: (seed + 1217) >>> 0 };
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["S","H","D","C"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function scoreRound(hand: number[], round: number): number {
  // Generic: score = sum of rank+1 for cards above (round-1) threshold
  let s = 0;
  for (const c of hand) {
    const r = c % 13; // 0..12
    if (r >= round - 1) s += r + 1;
  }
  // pair bonus
  const counts: Record<number, number> = {};
  for (const c of hand) { const r = c % 13; counts[r] = (counts[r] ?? 0) + 1; }
  for (const k of Object.keys(counts)) if ((counts[Number(k)] ?? 0) >= 2) s += 5;
  return s;
}

export function initialState(seed: number, _s: CantaloopSoloSettings): CantaloopSoloState {
  return { rngSeed: seed >>> 0, score: 0, round: 1, maxRounds: 10, hand: [], lastGain: 0, phase: "ready" };
}

export function reducer(state: CantaloopSoloState, action: CantaloopSoloAction): CantaloopSoloState {
  if (state.phase === "gameover") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const { hand, nextSeed } = deal5(state.rngSeed);
    const gain = scoreRound(hand, state.round);
    return { ...state, hand, rngSeed: nextSeed, lastGain: gain, score: state.score + gain, phase: "played" };
  }
  if (action.type === "next") {
    if (state.phase !== "played") return state;
    if (state.round >= state.maxRounds) return { ...state, phase: "gameover" };
    return { ...state, round: state.round + 1, hand: [], lastGain: 0, phase: "ready" };
  }
  return state;
}

export function isTerminal(state: CantaloopSoloState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
