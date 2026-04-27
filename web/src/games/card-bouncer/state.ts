import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Bouncer: 12 draws. Each draw shows a card; ACCEPT to score (rank * 1) or REJECT
// to push it to the back of the deck. Rejected cards bounce back later; if you reject a
// card and it comes back twice, you MUST accept (auto-accept counts as 0 score).
// Goal: be selective; accept only high cards.

export const TOTAL_DRAWS = 12;

export interface CardBouncerSettings { dummy: boolean; }

export interface CardBouncerState {
  rngSeed: number;
  draw: number;
  current: number | null;
  bounceCount: number; // count of bounces for current
  score: number;
  phase: "deciding" | "done";
}

export type CardBouncerAction = { type: "draw" } | { type: "accept" } | { type: "reject" };

export function rankOf(c: number): number {
  // Treat Ace as 14, K=13, Q=12, J=11, 10..2 by rank
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 14;
}
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _s: CardBouncerSettings): CardBouncerState {
  const rng = mulberry32(seed);
  const c = Math.floor(rng() * 52);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    draw: 1,
    current: c,
    bounceCount: 0,
    score: 0,
    phase: "deciding",
  };
}

export function reducer(state: CardBouncerState, action: CardBouncerAction): CardBouncerState {
  if (state.phase === "done") return state;
  if (action.type === "accept") {
    if (state.current === null) return state;
    const pts = rankOf(state.current);
    if (state.draw >= TOTAL_DRAWS) {
      return { ...state, score: state.score + pts, current: null, phase: "done" };
    }
    const rng = mulberry32(state.rngSeed);
    const next = Math.floor(rng() * 52);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      draw: state.draw + 1,
      current: next,
      bounceCount: 0,
      score: state.score + pts,
    };
  }
  if (action.type === "reject") {
    if (state.current === null) return state;
    if (state.bounceCount >= 1) {
      // forced auto-accept = 0 points
      if (state.draw >= TOTAL_DRAWS) {
        return { ...state, current: null, phase: "done" };
      }
      const rng = mulberry32(state.rngSeed);
      const next = Math.floor(rng() * 52);
      return {
        ...state,
        rngSeed: Math.floor(rng() * 2 ** 31),
        draw: state.draw + 1,
        current: next,
        bounceCount: 0,
      };
    }
    // first bounce: redraw a fresh candidate, increment bounces (the same "current" was bounced once)
    const rng = mulberry32(state.rngSeed);
    const next = Math.floor(rng() * 52);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      current: next,
      bounceCount: state.bounceCount + 1,
    };
  }
  return state;
}

export function isTerminal(state: CardBouncerState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
