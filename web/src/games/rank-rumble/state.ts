import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Rank Rumble: 10 rounds. Deal 4 cards. Bonus +50 if 3+ same rank. +30 if 2 pair. +100 if all 4 same rank. +10 base.
export const TOTAL_ROUNDS = 10;

export interface RankRumbleSettings { dummy: boolean; }
export interface RankRumbleState {
  rngSeed: number;
  round: number;
  hand: number[];
  score: number;
  phase: "dealing" | "scored" | "done";
  lastPts: number;
}
export type RankRumbleAction = { type: "deal" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal4(rng: () => number): number[] {
  const used = new Set<number>(); const out: number[] = [];
  while (out.length < 4) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); out.push(c); } }
  return out;
}

export function maxSameRank(hand: number[]): number {
  const counts: Record<number, number> = {};
  for (const c of hand) counts[c % 13] = (counts[c % 13] || 0) + 1;
  return Math.max(...Object.values(counts));
}

export function initialState(seed: number, _settings: RankRumbleSettings): RankRumbleState {
  return { rngSeed: seed, round: 1, hand: [], score: 0, phase: "dealing", lastPts: 0 };
}

export function reducer(state: RankRumbleState, action: RankRumbleAction): RankRumbleState {
  if (state.phase === "done") return state;
  if (action.type === "deal") {
    if (state.phase !== "dealing") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal4(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const max = maxSameRank(hand);
    let pts = 10;
    if (max === 4) pts = 200;
    else if (max === 3) pts = 50;
    else if (max === 2) {
      const counts: Record<number, number> = {};
      for (const c of hand) counts[c % 13] = (counts[c % 13] || 0) + 1;
      const pairs = Object.values(counts).filter(n => n === 2).length;
      if (pairs === 2) pts = 30;
      else pts = 15;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, hand, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, hand: [], phase: "dealing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: RankRumbleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
