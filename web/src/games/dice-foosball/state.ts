import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 18;
export const DIE_COUNT = 3;
export const TARGET_POINTS = 5;
export const POINT_VALUE = 12;
export const OPP_PENALTY = 6;
export const REMAIN_BONUS = 4;
export const BASE_SCORE = 60;

export interface DiceFoosballSettings { dummy: boolean; }

export interface DiceFoosballState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  myPoints: number;
  oppPoints: number;
  lastDelta: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceFoosballAction = { type: "roll" } | { type: "next" };

function evalRoll(dice: number[]): number {
  const sum = dice.reduce((a,b)=>a+b,0); if (sum>=16) return 1; if (sum<=5) return -1; return 0;
}

export function initialState(seed: number, _settings: DiceFoosballSettings): DiceFoosballState {
  return { rngSeed: seed, round: 1, dice: null, myPoints: 0, oppPoints: 0, lastDelta: 0, phase: "rolling" };
}

export function reducer(state: DiceFoosballState, action: DiceFoosballAction): DiceFoosballState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const delta = evalRoll(dice);
    const myPoints = state.myPoints + (delta > 0 ? delta : 0);
    const oppPoints = state.oppPoints + (delta < 0 ? -delta : 0);
    const won = myPoints >= TARGET_POINTS;
    const isLast = state.round >= TOTAL_ROUNDS || won;
    return { ...state, rngSeed: nextSeed, dice, myPoints, oppPoints, lastDelta: delta, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastDelta: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceFoosballState): { score: number } | null {
  if (state.phase !== "done") return null;
  const remaining = state.myPoints >= TARGET_POINTS ? Math.max(0, TOTAL_ROUNDS - state.round) : 0;
  return { score: BASE_SCORE + state.myPoints * POINT_VALUE - state.oppPoints * OPP_PENALTY + remaining * REMAIN_BONUS };
}
