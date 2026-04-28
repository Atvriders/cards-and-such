import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const DIE_COUNT = 4;

export interface DiceCrokinoleSettings { dummy: boolean; }

export interface DiceCrokinoleState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lastPts: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceCrokinoleAction = { type: "roll" } | { type: "next" };

function rollScore(dice: number[], _round: number): number {
  return dice.reduce((a,b)=>a+(b===6?20:b===5?15:b===4?10:b===3?5:0),0);
}

export function initialState(seed: number, _settings: DiceCrokinoleSettings): DiceCrokinoleState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lastPts: 0, phase: "rolling" };
}

export function reducer(state: DiceCrokinoleState, action: DiceCrokinoleAction): DiceCrokinoleState {
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

export function isTerminal(state: DiceCrokinoleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
