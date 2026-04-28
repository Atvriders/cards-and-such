import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceTempleSettings { dummy: boolean; }
export interface DiceTempleState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceTempleAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceTempleSettings): DiceTempleState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "rolling", lastPts: 0 };
}
export function scoreRoll(a: number, b: number, round: number): number {
  void round;
  if (a === b) return 20 + a * 2;
    return a + b;
}
export function reducer(state: DiceTempleState, action: DiceTempleAction): DiceTempleState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreRoll(a, b, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "rolling", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: DiceTempleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
