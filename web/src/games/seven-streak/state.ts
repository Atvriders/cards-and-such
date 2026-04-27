import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 12;
export interface SevenStreakSettings { dummy: boolean; }
export interface SevenStreakState { rngSeed: number; draw: number; lastCard: number | null; hit: boolean; sevens: number; score: number; phase: "drawing" | "result" | "done"; }
export type SevenStreakAction = { type: "draw" } | { type: "next" };
export function cardName(c: number): string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isSeven(c: number): boolean { return c % 13 === 5; }
export function initialState(seed: number, _s: SevenStreakSettings): SevenStreakState {
  return { rngSeed: seed, draw: 1, lastCard: null, hit: false, sevens: 0, score: 0, phase: "drawing" };
}
export function reducer(state: SevenStreakState, action: SevenStreakAction): SevenStreakState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "drawing") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hit = isSeven(c);
    const pts = hit ? 50 : 0;
    const isLast = state.draw >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, lastCard: c, hit, sevens: state.sevens + (hit?1:0), score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, draw: state.draw + 1, lastCard: null, hit: false, phase: "drawing" };
  }
  return state;
}
export function isTerminal(state: SevenStreakState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
