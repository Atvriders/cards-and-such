import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface CardJungleSettings { dummy: boolean; }
export interface CardJungleState {
  rngSeed: number;
  round: number;
  card: number | null;
  score: number;
  phase: "draw" | "scored" | "done";
  lastPts: number;
}
export type CardJungleAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
export function rankValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 14;
}
export function initialState(seed: number, _settings: CardJungleSettings): CardJungleState {
  return { rngSeed: seed, round: 1, card: null, score: 0, phase: "draw", lastPts: 0 };
}
function scoreFor(card: number, _round: number): number {
  // Reward face cards (J, Q, K) for navigating the 'jungle'.
  const v = rankValue(card);
  if (v >= 11 && v <= 13) return 30;
  if (v === 14) return 20; // ace
  return 5;
}
export function reducer(state: CardJungleState, action: CardJungleAction): CardJungleState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "draw") return state;
    const rng = mulberry32(state.rngSeed);
    const card = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreFor(card, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, card, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, card: null, phase: "draw", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: CardJungleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
