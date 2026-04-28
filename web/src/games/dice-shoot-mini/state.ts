import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceShootMiniSettings { dummy: boolean; }
export interface DiceShootMiniState {
  rngSeed: number;
  round: number;
  target: number; // value to hit (1..6)
  die: number | null; // last roll
  hits: number;
  score: number;
  phase: "aim" | "result" | "done";
}
export type DiceShootMiniAction = { type: "shoot" } | { type: "next" };
function rollTarget(rng: () => number): number { return 1 + Math.floor(rng() * 6); }
export function initialState(seed: number, _s: DiceShootMiniSettings): DiceShootMiniState {
  const rng = mulberry32(seed);
  const target = rollTarget(rng);
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, target, die: null, hits: 0, score: 0, phase: "aim" };
}
export function reducer(state: DiceShootMiniState, action: DiceShootMiniAction): DiceShootMiniState {
  if (state.phase === "done") return state;
  if (action.type === "shoot") {
    if (state.phase !== "aim") return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    const hit = die === state.target;
    const close = Math.abs(die - state.target) === 1;
    const points = hit ? 25 : close ? 5 : 0;
    return { ...state, rngSeed: next, die, hits: state.hits + (hit ? 1 : 0), score: state.score + points, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const target = rollTarget(rng);
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, target, die: null, phase: "aim" };
  }
  return state;
}
export function isTerminal(state: DiceShootMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
