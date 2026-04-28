import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceBazaarSettings { dummy: boolean; }
export interface DiceBazaarState {
  rngSeed: number;
  round: number;
  dice: number[];
  sum: number;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceBazaarAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceBazaarSettings): DiceBazaarState {
  return { rngSeed: seed, round: 1, dice: [], sum: 0, score: 0, phase: "rolling", lastPts: 0 };
}
export function reducer(state: DiceBazaarState, action: DiceBazaarAction): DiceBazaarState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6),1+Math.floor(rng()*6)];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = dice.reduce((a,b)=>a+b,0);
    const pts = (()=>{ const c: Record<number, number> = {}; for (const d of dice) c[d] = (c[d] || 0) + 1; let pts = 0; for (const k in c) if (c[k]! >= 2) pts += 8; return pts; })();
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, sum, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], sum: 0, phase: "rolling", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: DiceBazaarState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
