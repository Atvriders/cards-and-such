import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Straight Search: 10 draws of 5 cards each. Find a 5-card straight (consecutive ranks).
// +200 points per straight, +50 bonus if straight flush.

export const TOTAL_DRAWS = 10;

export interface StraightSearchSettings { dummy: boolean; }

export interface StraightSearchState {
  rngSeed: number;
  draw: number;
  hand: number[];
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
  hadStraight: boolean;
  straightFlush: boolean;
}

export type StraightSearchAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function rankOf(c: number): number { return c % 13; } // 0..12 = 2..A

export function isStraight(hand: number[]): boolean {
  // ranks 0..12 (2..A). Consider Ace-low (A,2,3,4,5) and Ace-high
  const ranks = hand.map(c => c % 13).sort((a,b)=>a-b);
  if (new Set(ranks).size !== 5) return false;
  if (ranks[4]! - ranks[0]! === 4) return true;
  // Ace low: 0,1,2,3,12 means 2,3,4,5,A
  if (ranks[0] === 0 && ranks[1] === 1 && ranks[2] === 2 && ranks[3] === 3 && ranks[4] === 12) return true;
  return false;
}
export function isFlush(hand: number[]): boolean {
  const suits = hand.map(c => Math.floor(c / 13));
  return new Set(suits).size === 1;
}

function deal5(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

export function initialState(seed: number, _settings: StraightSearchSettings): StraightSearchState {
  return { rngSeed: seed, draw: 1, hand: [], score: 0, phase: "dealing", lastPts: 0, hadStraight: false, straightFlush: false };
}

export function reducer(state: StraightSearchState, action: StraightSearchAction): StraightSearchState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const straight = isStraight(hand);
    const flush = isFlush(hand);
    const sf = straight && flush;
    let pts = 0;
    if (straight) pts += 200;
    if (sf) pts += 50;
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, hand, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts, hadStraight: straight, straightFlush: sf };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, draw: state.draw + 1, hand: [], phase: "dealing", lastPts: 0, hadStraight: false, straightFlush: false };
  }
  return state;
}

export function isTerminal(state: StraightSearchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
