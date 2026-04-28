import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface CardFountainSettings { dummy: boolean; }

export interface CardFountainState {
  rngSeed: number;
  round: number;
  card: number | null;
  score: number;
  lastPts: number;
  phase: "draw" | "scored" | "done";
}

export type CardFountainAction = { type: "draw" } | { type: "next" };

export function rankOf(c: number): number { return c % 13; } // 0..12 -> 2..A
export function suitOf(c: number): number { return Math.floor(c / 13); }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function scoreCard(c: number): number {
  const r = c % 13; // 0..12 (2..A)
  const red = isRed(c);
  if (r === 12) return 30; if (r >= 9) return 15; return 5;
}

export function initialState(seed: number, _settings: CardFountainSettings): CardFountainState {
  return { rngSeed: seed, round: 1, card: null, score: 0, lastPts: 0, phase: "draw" };
}

export function reducer(state: CardFountainState, action: CardFountainAction): CardFountainState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "draw") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreCard(c);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, card: c, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, card: null, lastPts: 0, phase: "draw" };
  }
  return state;
}

export function isTerminal(state: CardFountainState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
