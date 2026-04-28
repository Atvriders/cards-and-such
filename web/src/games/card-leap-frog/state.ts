import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const POINTS_PER_WIN = 10;
export interface CardLeapFrogSettings { dummy: boolean; }
export interface CardLeapFrogState {
  rngSeed: number;
  round: number;
  card: number | null;
  score: number;
  phase: "draw" | "result" | "done";
  lastWin: boolean;
  lastPts: number;
}
export type CardLeapFrogAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function rank(c: number): number { return c % 13; }
export function suit(c: number): number { return Math.floor(c / 13); }
export function cardWins(c: number): boolean { const r = c % 13; return r % 2 === 0; }
export function initialState(seed: number, _settings: CardLeapFrogSettings): CardLeapFrogState {
  return { rngSeed: seed, round: 1, card: null, score: 0, phase: "draw", lastWin: false, lastPts: 0 };
}
export function reducer(state: CardLeapFrogState, action: CardLeapFrogAction): CardLeapFrogState {
  if (state.phase === "done") return state;
  if (action.type === "draw" && state.phase === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = cardWins(c);
    const pts = win ? POINTS_PER_WIN : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, card: c, score: state.score + pts, phase: isLast ? "done" : "result", lastWin: win, lastPts: pts };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, card: null, phase: "draw", lastWin: false, lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: CardLeapFrogState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
