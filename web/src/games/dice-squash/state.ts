import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 25;
export const DIE_COUNT = 2;
export const TARGET_POINTS = 11;
export const POINT_VALUE = 10;
export const OPP_PENALTY = 5;
export const REMAIN_BONUS = 3;
export const BASE_SCORE = 60;

export interface DiceSquashSettings { dummy: boolean; }

export interface DiceSquashState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  myPoints: number;
  oppPoints: number;
  lastDelta: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceSquashAction = { type: "roll" } | { type: "next" };

function evalRoll(dice: number[]): number {
  const a = dice[0]!, b = dice[1]!; if (a>=5 && b>=5) return 1; if (a<=2 && b<=2) return -1; const sum = a+b; if (sum>=10) return 1; if (sum<=4) return -1; return 0;
}

export function initialState(seed: number, _settings: DiceSquashSettings): DiceSquashState {
  return { rngSeed: seed, round: 1, dice: null, myPoints: 0, oppPoints: 0, lastDelta: 0, phase: "rolling" };
}

export function reducer(state: DiceSquashState, action: DiceSquashAction): DiceSquashState {
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

export function isTerminal(state: DiceSquashState): { score: number } | null {
  if (state.phase !== "done") return null;
  const remaining = state.myPoints >= TARGET_POINTS ? Math.max(0, TOTAL_ROUNDS - state.round) : 0;
  return { score: BASE_SCORE + state.myPoints * POINT_VALUE - state.oppPoints * OPP_PENALTY + remaining * REMAIN_BONUS };
}
