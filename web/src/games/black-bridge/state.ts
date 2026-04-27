import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 12;
export interface BlackBridgeSettings { dummy: boolean; }
export interface BlackBridgeState { rngSeed: number; draw: number; lastCard: number | null; streak: number; bestStreak: number; score: number; phase: "drawing" | "result" | "done"; }
export type BlackBridgeAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isBlack(c: number): boolean { return !isRed(c); }
export function initialState(seed: number, _s: BlackBridgeSettings): BlackBridgeState {
  return { rngSeed: seed, draw: 1, lastCard: null, streak: 0, bestStreak: 0, score: 0, phase: "drawing" };
}
export function reducer(state: BlackBridgeState, action: BlackBridgeAction): BlackBridgeState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const black = isBlack(c);
    const newStreak = black ? state.streak + 1 : 0;
    const pts = black ? 10 * newStreak : 0;
    const best = Math.max(state.bestStreak, newStreak);
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, lastCard: c, streak: newStreak, bestStreak: best, score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, draw: state.draw + 1, lastCard: null, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: BlackBridgeState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
