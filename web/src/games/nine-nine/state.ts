import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Nine Nine: 12 draws. Each draw scores +60 if rank is 9, +0 otherwise. +5 for any non-nine.
export const TOTAL_DRAWS = 12;

export interface NineNineSettings { dummy: boolean; }
export interface NineNineState {
  rngSeed: number;
  draw: number;
  card: number | null;
  score: number;
  phase: "drawing" | "scored" | "done";
  lastPts: number;
  ninesCount: number;
}
export type NineNineAction = { type: "draw" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function isNine(c: number): boolean { return c % 13 === 7; }

export function initialState(seed: number, _settings: NineNineSettings): NineNineState {
  return { rngSeed: seed, draw: 1, card: null, score: 0, phase: "drawing", lastPts: 0, ninesCount: 0 };
}

export function reducer(state: NineNineState, action: NineNineAction): NineNineState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nine = isNine(c);
    const pts = nine ? 60 : 5;
    const nines = state.ninesCount + (nine ? 1 : 0);
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, card: c, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts, ninesCount: nines };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, draw: state.draw + 1, card: null, phase: "drawing", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: NineNineState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
