import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const POINTS_PER_WIN = 10;
export const TARGET_THRESHOLD = 6;
export interface DiceTradeRouteSettings { dummy: boolean; }
export interface DiceTradeRouteState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "roll" | "result" | "done";
  lastWin: boolean;
  lastPts: number;
}
export type DiceTradeRouteAction = { type: "roll" } | { type: "next" };
export function isWin(a: number, b: number): boolean { const s = a + b; return s >= 6 && s <= 9; }
export function initialState(seed: number, _settings: DiceTradeRouteSettings): DiceTradeRouteState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "roll", lastWin: false, lastPts: 0 };
}
export function reducer(state: DiceTradeRouteState, action: DiceTradeRouteAction): DiceTradeRouteState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = isWin(a, b);
    const pts = win ? POINTS_PER_WIN : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + pts, phase: isLast ? "done" : "result", lastWin: win, lastPts: pts };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, dice: null, phase: "roll", lastWin: false, lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: DiceTradeRouteState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
