import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TARGET = 100;
export interface DiceMountainSettings { dummy: boolean; }
export interface DiceMountainState {
  rngSeed: number;
  altitude: number;
  rolls: number;
  dice: [number, number] | null;
  score: number;
  phase: "roll" | "scored" | "done";
  lastDelta: number;
}
export type DiceMountainAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceMountainSettings): DiceMountainState {
  return { rngSeed: seed, altitude: 0, rolls: 0, dice: null, score: 0, phase: "roll", lastDelta: 0 };
}
export function reducer(state: DiceMountainState, action: DiceMountainAction): DiceMountainState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const delta = a + b;
    const altitude = state.altitude + delta;
    const rolls = state.rolls + 1;
    const reached = altitude >= TARGET;
    const score = reached ? Math.max(0, 200 - rolls * 5) : 0;
    return { ...state, rngSeed: nextSeed, dice: [a, b], altitude, rolls, score: reached ? score : state.score, phase: reached ? "done" : "scored", lastDelta: delta };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, dice: null, phase: "roll", lastDelta: 0 };
  }
  return state;
}
export function isTerminal(state: DiceMountainState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
