import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Score by drawing 10s; +50 per match across 12 draws.

export const TOTAL_DRAWS = 12;
export const HAND_SIZE = 5;
export const TARGET_RANK = 8; // 0..12 = 2..A; J=9, Q=10, K=11, 10=8
export const POINTS_PER = 50;

export interface TensTallySettings { dummy: boolean; }

export interface TensTallyState {
  rngSeed: number;
  draw: number;
  hand: number[];
  matchedIdx: number[];
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}

export type TensTallyAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function dealHand(rng: () => number, n: number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < n) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: TensTallySettings): TensTallyState {
  return { rngSeed: seed, draw: 1, hand: [], matchedIdx: [], score: 0, phase: "dealing", lastPts: 0 };
}

export function reducer(state: TensTallyState, action: TensTallyAction): TensTallyState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng, HAND_SIZE);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const matched: number[] = [];
    hand.forEach((c, i) => { if (c % 13 === TARGET_RANK) matched.push(i); });
    const pts = matched.length * POINTS_PER;
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, hand, matchedIdx: matched, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, draw: state.draw + 1, hand: [], matchedIdx: [], phase: "dealing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: TensTallyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
