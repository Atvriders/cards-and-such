import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DIE_COUNT = 2;

export interface DiceMolkkySettings { dummy: boolean; }

export interface DiceMolkkyState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceMolkkyAction = { type: "roll" } | { type: "next" };

function rollScore(dice: number[], _round: number): number {
  return (dice[0]===dice[1]) ? dice[0]! : 2;
}

export function initialState(seed: number, _settings: DiceMolkkySettings): DiceMolkkyState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DiceMolkkyState, action: DiceMolkkyAction): DiceMolkkyState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = rollScore(dice, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceMolkkyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
