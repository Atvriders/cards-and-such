import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_HOLES = 9;
export const PAR = 3;
export const MAX_STROKES = 5;
export const DIE_COUNT = 3;

export interface DiceDiscGolfSettings { dummy: boolean; }

export interface DiceDiscGolfState {
  rngSeed: number;
  hole: number;
  dice: number[] | null;
  strokes: number; // strokes on current/last hole
  totalStrokes: number;
  phase: "rolling" | "rolled" | "done";
}

export type DiceDiscGolfAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceDiscGolfSettings): DiceDiscGolfState {
  return { rngSeed: seed, hole: 1, dice: null, strokes: 0, totalStrokes: 0, phase: "rolling" };
}

export function reducer(state: DiceDiscGolfState, action: DiceDiscGolfAction): DiceDiscGolfState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let strokes = MAX_STROKES;
    for (let i = 0; i < dice.length; i++) {
      if (dice[i]! >= 5) { strokes = i + 1; break; }
    }
    const isLast = state.hole >= TOTAL_HOLES;
    return { ...state, rngSeed: nextSeed, dice, strokes, totalStrokes: state.totalStrokes + strokes, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, hole: state.hole + 1, dice: null, strokes: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceDiscGolfState): { score: number } | null {
  if (state.phase !== "done") return null;
  const overPar = state.totalStrokes - PAR * TOTAL_HOLES;
  return { score: Math.max(0, 100 - overPar) };
}
