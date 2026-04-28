import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 25;
export const DIE_COUNT = 3;
export const TARGET_MAX = 20;

export interface DiceAroundClockSettings { dummy: boolean; }

export interface DiceAroundClockState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  target: number;
  advanced: boolean;
  phase: "rolling" | "rolled" | "done";
}

export type DiceAroundClockAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceAroundClockSettings): DiceAroundClockState {
  return { rngSeed: seed, round: 1, dice: null, target: 1, advanced: false, phase: "rolling" };
}

export function reducer(state: DiceAroundClockState, action: DiceAroundClockAction): DiceAroundClockState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const maxDie = Math.max(...dice);
    const need = Math.ceil(state.target / 4);
    const advanced = maxDie >= need;
    const newTarget = advanced ? Math.min(TARGET_MAX, state.target + 1) : state.target;
    const cleared = newTarget > TARGET_MAX || (advanced && state.target === TARGET_MAX);
    const isLast = state.round >= TOTAL_ROUNDS || cleared;
    return { ...state, rngSeed: nextSeed, dice, target: newTarget, advanced, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, advanced: false, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceAroundClockState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.min(TARGET_MAX, state.target) * 5 };
}
