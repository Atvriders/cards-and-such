import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DiceShootSettings { dummy: boolean; }

export interface DiceShootState {
  rngSeed: number;
  round: number;
  target: number | null;
  roll: number | null;
  score: number;
  phase: "set-target" | "roll" | "result" | "done";
  lastWin: boolean;
}

export type DiceShootAction = { type: "setTarget" } | { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceShootSettings): DiceShootState {
  return { rngSeed: seed, round: 1, target: null, roll: null, score: 0, phase: "set-target", lastWin: false };
}

export function reducer(state: DiceShootState, action: DiceShootAction): DiceShootState {
  if (state.phase === "done") return state;
  if (action.type === "setTarget") {
    if (state.phase !== "set-target") return state;
    const rng = mulberry32(state.rngSeed);
    const target = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, target, phase: "roll" };
  }
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const roll = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = roll === state.target;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, roll, score: state.score + (win ? 30 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, target: null, roll: null, phase: "set-target", lastWin: false };
  }
  return state;
}

export function isTerminal(state: DiceShootState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
