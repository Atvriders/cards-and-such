import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DrawmahaHiPokerSettings { rounds: "10"; }

export interface DrawmahaHiPokerState {
  rngSeed: number;
  score: number;
  round: number;
  maxRounds: number;
  hand: number[];
  lastGain: number;
  phase: "ready" | "dealt" | "gameover";
}

export type DrawmahaHiPokerAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["S","H","D","C"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal5(seed: number): { hand: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const used = new Set<number>();
  const hand: number[] = [];
  while (hand.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); hand.push(c); }
  }
  return { hand, nextSeed: (seed + 9001) >>> 0 };
}

export function scoreHand(hand: number[]): number {
  if (hand.length === 0) return 0;
  const ranks = hand.map(c => c % 13);
  const suits = hand.map(c => Math.floor(c / 13));
  const counts: Record<number, number> = {};
  for (const r of ranks) counts[r] = (counts[r] ?? 0) + 1;
  const cs = Object.values(counts).sort((a, b) => b - a);
  const flush = suits.every(s => s === suits[0]);
  const sorted = [...new Set(ranks)].sort((a, b) => a - b);
  let straight = sorted.length === 5;
  if (straight) for (let i = 1; i < 5; i++) if (sorted[i]! - sorted[i-1]! !== 1) { straight = false; break; }
  if (flush && straight) return 200;
  if (cs[0] === 4) return 150;
  if (cs[0] === 3 && cs[1] === 2) return 100;
  if (flush) return 80;
  if (straight) return 60;
  if (cs[0] === 3) return 40;
  if (cs[0] === 2 && cs[1] === 2) return 25;
  if (cs[0] === 2) return 10;
  return 1;
}

export function initialState(seed: number, _s: DrawmahaHiPokerSettings): DrawmahaHiPokerState {
  return { rngSeed: seed >>> 0, score: 0, round: 1, maxRounds: 10, hand: [], lastGain: 0, phase: "ready" };
}

export function reducer(state: DrawmahaHiPokerState, action: DrawmahaHiPokerAction): DrawmahaHiPokerState {
  if (state.phase === "gameover") return state;
  if (action.type === "deal") {
    if (state.phase !== "ready") return state;
    const { hand, nextSeed } = deal5(state.rngSeed);
    const gain = scoreHand(hand);
    return { ...state, hand, rngSeed: nextSeed, lastGain: gain, score: state.score + gain, phase: "dealt" };
  }
  if (action.type === "next") {
    if (state.phase !== "dealt") return state;
    if (state.round >= state.maxRounds) return { ...state, phase: "gameover" };
    return { ...state, round: state.round + 1, hand: [], lastGain: 0, phase: "ready" };
  }
  return state;
}

export function isTerminal(state: DrawmahaHiPokerState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
