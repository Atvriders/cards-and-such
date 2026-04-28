import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const GOAL = 100;
export const MAX_ROLLS = 25;
export interface DiceRocketSettings { dummy: boolean; }
export interface DiceRocketState {
  rngSeed: number;
  altitude: number;
  rolls: number;
  lastDie: number | null;
  phase: "playing" | "done";
}
export type DiceRocketAction = { type: "boost" };
export function initialState(seed: number, _s: DiceRocketSettings): DiceRocketState {
  return { rngSeed: seed, altitude: 0, rolls: 0, lastDie: null, phase: "playing" };
}
export function reducer(state: DiceRocketState, action: DiceRocketAction): DiceRocketState {
  if (state.phase === "done") return state;
  if (action.type === "boost") {
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    const altitude = state.altitude + die;
    const rolls = state.rolls + 1;
    const reachedGoal = altitude >= GOAL;
    const phase = (reachedGoal || rolls >= MAX_ROLLS) ? "done" : "playing";
    return { ...state, rngSeed: next, altitude, rolls, lastDie: die, phase };
  }
  return state;
}
export function isTerminal(state: DiceRocketState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.altitude >= GOAL) return { score: Math.max(50, 500 - state.rolls * 10) };
  return { score: state.altitude };
}
