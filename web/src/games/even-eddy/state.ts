import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DRAWS = 12;
export const POINTS_PER_HIT = 20;

export interface EvenEddySettings { dummy: boolean; }

export interface EvenEddyState {
  rngSeed: number;
  draw: number;
  card: number | null;
  hits: number;
  score: number;
  phase: "drawing" | "shown" | "done";
  lastWasHit: boolean;
}

export type EvenEddyAction = { type: "draw" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function isBlack(c: number): boolean { return !isRed(c); }
export function rankIndex(c: number): number { return c % 13; }
export function isHit(c: number): boolean { const r=rankIndex(c); return r===0||r===2||r===4||r===6||r===8||r===10; }

export function initialState(seed: number, _settings: EvenEddySettings): EvenEddyState {
  return { rngSeed: seed, draw: 1, card: null, hits: 0, score: 0, phase: "drawing", lastWasHit: false };
}

export function reducer(state: EvenEddyState, action: EvenEddyAction): EvenEddyState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hit = isHit(c);
    const pts = hit ? POINTS_PER_HIT : 0;
    const isLast = state.draw >= TOTAL_DRAWS;
    return {
      ...state,
      rngSeed: nextSeed,
      card: c,
      hits: state.hits + (hit ? 1 : 0),
      score: state.score + pts,
      phase: isLast ? "done" : "shown",
      lastWasHit: hit,
    };
  }
  if (action.type === "next") {
    if (state.phase !== "shown") return state;
    return { ...state, draw: state.draw + 1, card: null, phase: "drawing", lastWasHit: false };
  }
  return state;
}

export function isTerminal(state: EvenEddyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
