import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const GRID_SIZE = 5;
export const CELL_COUNT = 25;
export const TOTAL_ROLLS = 14;
export interface RollingAmericaSettings { dummy: boolean; }
export interface RollingAmericaState {
  rngSeed: number;
  cells: boolean[];
  cellValues: number[]; // value rolled into each cell (0 if unmarked)
  rolls: number;
  lastRoll: number | null;
  score: number;
  phase: "rolling" | "marking" | "done";
}
export type RollingAmericaAction =
  | { type: "roll" }
  | { type: "mark"; index: number }
  | { type: "skip" };

export function initialState(seed: number, _s: RollingAmericaSettings): RollingAmericaState {
  return {
    rngSeed: seed,
    cells: new Array(CELL_COUNT).fill(false),
    cellValues: new Array(CELL_COUNT).fill(0),
    rolls: 0,
    lastRoll: null,
    score: 0,
    phase: "rolling",
  };
}

export function reducer(state: RollingAmericaState, action: RollingAmericaAction): RollingAmericaState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, lastRoll: d, phase: "marking" };
  }
  if (action.type === "mark") {
    if (state.phase !== "marking") return state;
    if (action.index < 0 || action.index >= CELL_COUNT) return state;
    if (state.cells[action.index]) return state;
    const cells = [...state.cells];
    cells[action.index] = true;
    const cellValues = [...state.cellValues];
    cellValues[action.index] = state.lastRoll ?? 0;
    const rolls = state.rolls + 1;
    const score = state.score + (state.lastRoll ?? 0);
    const phase: "rolling" | "marking" | "done" =
      rolls >= TOTAL_ROLLS || cells.every(Boolean) ? "done" : "rolling";
    return { ...state, cells, cellValues, rolls, score, phase };
  }
  if (action.type === "skip") {
    if (state.phase !== "marking") return state;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "marking" | "done" = rolls >= TOTAL_ROLLS ? "done" : "rolling";
    return { ...state, rolls, phase };
  }
  return state;
}

export function isTerminal(state: RollingAmericaState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Bonus: rows + columns + completion
  const cells = state.cells;
  let bonus = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    let full = true;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!cells[r * GRID_SIZE + c]) { full = false; break; }
    }
    if (full) bonus += 5;
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!cells[r * GRID_SIZE + c]) { full = false; break; }
    }
    if (full) bonus += 5;
  }
  if (cells.every(Boolean)) bonus += 10;
  return { score: state.score + bonus };
}
