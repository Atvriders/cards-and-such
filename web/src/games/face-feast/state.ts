import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Face Feast: 15 draws of 1 card.
// Face card (J/Q/K) = 5 points; Ace = 5; Number = 1 point.

export const TOTAL_DRAWS = 15;

export interface FaceFeastSettings { dummy: boolean; }

export interface FaceFeastState {
  rngSeed: number;
  drawNumber: number;
  card: number | null;
  score: number;
  phase: "ready" | "revealed" | "done";
  lastPts: number;
}

export type FaceFeastAction = { type: "draw" } | { type: "next" };

export function isFaceCard(c: number): boolean {
  const r = c % 13;
  return r >= 9 && r <= 11; // J=9, Q=10, K=11 in our index
}
export function isAce(c: number): boolean { return (c % 13) === 12; }

export function cardPoints(c: number): number {
  if (isFaceCard(c) || isAce(c)) return 5;
  return 1;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _settings: FaceFeastSettings): FaceFeastState {
  return { rngSeed: seed, drawNumber: 0, card: null, score: 0, phase: "ready", lastPts: 0 };
}

export function reducer(state: FaceFeastState, action: FaceFeastAction): FaceFeastState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = cardPoints(c);
    const dn = state.drawNumber + 1;
    const isLast = dn >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, card: c, score: state.score + pts, phase: isLast ? "done" : "revealed", drawNumber: dn, lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, phase: "ready", card: null };
  }
  return state;
}

export function isTerminal(state: FaceFeastState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
