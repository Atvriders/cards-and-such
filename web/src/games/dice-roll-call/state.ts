import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceRollCallSettings { dummy: boolean; }
export interface DiceRollCallState {
  rngSeed: number;
  round: number;
  call: number | null;
  die: number | null;
  score: number;
  phase: "call" | "result" | "done";
}
export type DiceRollCallAction = { type: "call"; value: number } | { type: "next" };
export function initialState(seed: number, _s: DiceRollCallSettings): DiceRollCallState {
  return { rngSeed: seed, round: 1, call: null, die: null, score: 0, phase: "call" };
}
export function reducer(state: DiceRollCallState, action: DiceRollCallAction): DiceRollCallState {
  if (state.phase === "done") return state;
  if (action.type === "call") {
    if (state.phase !== "call") return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const next = Math.floor(rng() * 2 ** 31);
    const exact = die === action.value;
    const close = Math.abs(die - action.value) === 1;
    const pts = exact ? 30 : close ? 8 : 0;
    return { ...state, rngSeed: next, call: action.value, die, score: state.score + pts, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: state.round + 1, call: null, die: null, phase: "call" };
  }
  return state;
}
export function isTerminal(state: DiceRollCallState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
