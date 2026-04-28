import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface DiceCastleSettings { dummy: boolean; }
export interface DiceCastleState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
}
export type DiceCastleAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceCastleSettings): DiceCastleState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "rolling", lastPts: 0 };
}
export function scoreRoll(a: number, b: number, round: number): number {
  void round;
  const sum = a + b;
    const bonus = (a === b) ? 8 : 0;
    const high = (a >= 5 && b >= 5) ? 6 : 0;
    return sum * 2 + bonus + high;
}
export function reducer(state: DiceCastleState, action: DiceCastleAction): DiceCastleState {
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
export function isTerminal(state: DiceCastleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
