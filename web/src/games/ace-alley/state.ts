import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Ace Alley: 8 draws of a single card. +100 per ace.
export const TOTAL_DRAWS = 8;
export interface AceAlleySettings { dummy: boolean; }
export interface AceAlleyState { rngSeed: number; draw: number; lastCard: number | null; isAce: boolean; aces: number; score: number; phase: "drawing" | "result" | "done"; }
export type AceAlleyAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isAceCard(c: number): boolean { return c % 13 === 12; }
export function initialState(seed: number, _s: AceAlleySettings): AceAlleyState {
  return { rngSeed: seed, draw: 1, lastCard: null, isAce: false, aces: 0, score: 0, phase: "drawing" };
}
export function reducer(state: AceAlleyState, action: AceAlleyAction): AceAlleyState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const ace = isAceCard(c);
    const pts = ace ? 100 : 0;
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, lastCard: c, isAce: ace, aces: state.aces + (ace?1:0), score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, draw: state.draw + 1, lastCard: null, isAce: false, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: AceAlleyState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
