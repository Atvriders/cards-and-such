import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 15;
export const DIE_COUNT = 4;

export interface DiceSpikeballSettings { dummy: boolean; }

export interface DiceSpikeballState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceSpikeballAction = { type: "roll" } | { type: "next" };

function rollScore(dice: number[], _round: number): number {
  return (dice.filter(d=>d===6).length>=3?3:dice.filter(d=>d===6).length===2?2:dice.filter(d=>d===6).length===1?1:0) - (dice.every(d=>d<=3)?1:0);
}

export function initialState(seed: number, _settings: DiceSpikeballSettings): DiceSpikeballState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DiceSpikeballState, action: DiceSpikeballAction): DiceSpikeballState {
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

export function isTerminal(state: DiceSpikeballState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
