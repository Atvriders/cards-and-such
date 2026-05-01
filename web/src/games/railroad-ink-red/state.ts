import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const GRID_SIZE = 4;
export const CELL_COUNT = 16;
export const TOTAL_ROLLS = 12;
export const DIE_MAX = 6;

export interface RailroadInkRedSettings { dummy: boolean; }
export interface RailroadInkRedState {
  rngSeed: number;
  cells: boolean[];
  cellValues: number[];
  rolls: number;
  lastRoll: number | null;
  score: number;
  phase: "rolling" | "marking" | "done";
}
export type RailroadInkRedAction =
  | { type: "roll" }
  | { type: "mark"; index: number }
  | { type: "skip" }
  | { type: "reset" };

export function initialState(seed: number, _s: RailroadInkRedSettings): RailroadInkRedState {
  return {
    rngSeed: seed >>> 0,
    cells: new Array(CELL_COUNT).fill(false),
    cellValues: new Array(CELL_COUNT).fill(0),
    rolls: 0,
    lastRoll: null,
    score: 0,
    phase: "rolling",
  };
}

// Each cell has a "zone color" 0..3 based on its position. Roll value matches give bonuses.
export function cellZone(idx: number): number {
  const r = Math.floor(idx / GRID_SIZE);
  const c = idx % GRID_SIZE;
  return ((r + c) % 4 + Math.floor((r * GRID_SIZE + c) / 5)) % 4;
}

// Score this mark: base value + themed bonus.
export function markValue(roll: number, idx: number, cells: boolean[], cellValues: number[]): number {
  const zone = cellZone(idx);
  let v = roll;
  // Themed bonus: matching zone-roll. Zone 0 likes low rolls, 3 likes high.
  if (zone === 0 && roll <= 2) v += 2;
  if (zone === 1 && roll >= 3 && roll <= 4) v += 2;
  if (zone === 2 && roll === 5) v += 3;
  if (zone === 3 && roll >= 5) v += 3;
  // Adjacency bonus: same value adjacent
  const r = Math.floor(idx / GRID_SIZE);
  const c = idx % GRID_SIZE;
  const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
    const ni = nr * GRID_SIZE + nc;
    if (cells[ni] && cellValues[ni] === roll) v += 1;
  }
  return v;
}

export function reducer(state: RailroadInkRedState, action: RailroadInkRedAction): RailroadInkRedState {
  if (state.phase === "done") return state;
  if (action.type === "reset") return initialState(state.rngSeed, { dummy: false });
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d = 1 + Math.floor(rng() * DIE_MAX);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed >>> 0, lastRoll: d, phase: "marking" };
  }
  if (action.type === "mark") {
    if (state.phase !== "marking") return state;
    if (action.index < 0 || action.index >= CELL_COUNT) return state;
    if (state.cells[action.index]) return state;
    const cells = [...state.cells];
    cells[action.index] = true;
    const cellValues = [...state.cellValues];
    cellValues[action.index] = state.lastRoll ?? 0;
    const gain = markValue(state.lastRoll ?? 0, action.index, state.cells, state.cellValues);
    const rolls = state.rolls + 1;
    const phase: "rolling" | "marking" | "done" =
      rolls >= TOTAL_ROLLS || cells.every(Boolean) ? "done" : "rolling";
    return { ...state, cells, cellValues, rolls, score: state.score + gain, phase };
  }
  if (action.type === "skip") {
    if (state.phase !== "marking") return state;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "marking" | "done" = rolls >= TOTAL_ROLLS ? "done" : "rolling";
    return { ...state, rolls, phase };
  }
  return state;
}

export function isTerminal(state: RailroadInkRedState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Bonuses: full row +4, full column +4, full board +12.
  let bonus = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    let full = true;
    for (let c = 0; c < GRID_SIZE; c++) if (!state.cells[r * GRID_SIZE + c]) { full = false; break; }
    if (full) bonus += 4;
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) if (!state.cells[r * GRID_SIZE + c]) { full = false; break; }
    if (full) bonus += 4;
  }
  if (state.cells.every(Boolean)) bonus += 12;
  return { score: state.score + bonus };
}
