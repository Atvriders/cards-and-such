import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const GRID_SIZE = 7;
export const CELL_COUNT = 49;
export const TOTAL_TILES = 14;
export const NUM_TYPES = 5;
export interface TokaidoBaseSettings { dummy: boolean; }
export interface TokaidoBaseState {
  rngSeed: number;
  cells: number[]; // -1 empty, 0..NUM_TYPES-1 = tile type
  queue: number[]; // upcoming tile types
  placed: number;
  score: number;
  phase: "playing" | "done";
}
export type TokaidoBaseAction = { type: "place"; index: number };

function genQueue(rng: () => number): number[] {
  const q: number[] = [];
  for (let i = 0; i < TOTAL_TILES; i++) q.push(Math.floor(rng() * NUM_TYPES));
  return q;
}

export function initialState(seed: number, _s: TokaidoBaseSettings): TokaidoBaseState {
  const rng = mulberry32(seed);
  const queue = genQueue(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    cells: new Array(CELL_COUNT).fill(-1),
    queue,
    placed: 0,
    score: 0,
    phase: "playing",
  };
}

function neighbors(idx: number): number[] {
  const r = Math.floor(idx / GRID_SIZE);
  const c = idx % GRID_SIZE;
  const n: number[] = [];
  if (r > 0) n.push(idx - GRID_SIZE);
  if (r < GRID_SIZE - 1) n.push(idx + GRID_SIZE);
  if (c > 0) n.push(idx - 1);
  if (c < GRID_SIZE - 1) n.push(idx + 1);
  return n;
}

export function scoreBoard(cells: number[]): number {
  let score = 0;
  for (let i = 0; i < cells.length; i++) {
    const v = cells[i];
    if (v === undefined || v < 0) continue;
    score += 1; // base per tile
    for (const ni of neighbors(i)) {
      const nv = cells[ni];
      if (nv !== undefined && nv === v) score += 1; // adjacency bonus
    }
  }
  return score;
}

export function reducer(state: TokaidoBaseState, action: TokaidoBaseAction): TokaidoBaseState {
  if (state.phase === "done") return state;
  if (action.type === "place") {
    if (state.placed >= TOTAL_TILES) return state;
    if (action.index < 0 || action.index >= CELL_COUNT) return state;
    if (state.cells[action.index] !== -1) return state;
    const tile = state.queue[state.placed];
    if (tile === undefined) return state;
    const cells = [...state.cells];
    cells[action.index] = tile;
    const placed = state.placed + 1;
    const phase: "playing" | "done" = placed >= TOTAL_TILES ? "done" : "playing";
    const score = phase === "done" ? scoreBoard(cells) : state.score;
    return { ...state, cells, placed, score, phase };
  }
  return state;
}

export function isTerminal(state: TokaidoBaseState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
