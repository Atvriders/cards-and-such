import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 8;

export type Pattern = "empty" | "glider" | "blinker" | "random";

export interface ConwaySettings { dummy: boolean; }
export interface ConwayState {
  rngSeed: number;
  grid: number[]; // length SIZE*SIZE, 0 or 1
  generation: number;
  liveSum: number; // accumulated live cells across generations (for score)
  phase: "editing" | "running" | "done";
}
export type ConwayAction =
  | { type: "toggle"; idx: number }
  | { type: "step" }
  | { type: "preset"; preset: Pattern }
  | { type: "reset" }
  | { type: "finish" };

export function emptyGrid(): number[] { return new Array(SIZE * SIZE).fill(0); }

export function initialState(seed: number, _s: ConwaySettings): ConwayState {
  return { rngSeed: seed, grid: emptyGrid(), generation: 0, liveSum: 0, phase: "editing" };
}

function applyPreset(seed: number, preset: Pattern): { grid: number[]; nextSeed: number } {
  const grid = emptyGrid();
  const at = (r: number, c: number) => { if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) grid[r * SIZE + c] = 1; };
  let nextSeed = seed;
  if (preset === "glider") {
    at(0, 1); at(1, 2); at(2, 0); at(2, 1); at(2, 2);
  } else if (preset === "blinker") {
    at(3, 2); at(3, 3); at(3, 4);
  } else if (preset === "random") {
    const rng = mulberry32(seed);
    for (let i = 0; i < SIZE * SIZE; i++) grid[i] = rng() < 0.35 ? 1 : 0;
    nextSeed = Math.floor(rng() * 2 ** 31);
  }
  return { grid, nextSeed };
}

export function step(grid: number[]): number[] {
  const next = emptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
        n += grid[nr * SIZE + nc]!;
      }
      const cur = grid[r * SIZE + c]!;
      if (cur === 1 && (n === 2 || n === 3)) next[r * SIZE + c] = 1;
      else if (cur === 0 && n === 3) next[r * SIZE + c] = 1;
    }
  }
  return next;
}

export function liveCount(grid: number[]): number {
  let n = 0; for (const v of grid) n += v; return n;
}

export function reducer(state: ConwayState, action: ConwayAction): ConwayState {
  if (state.phase === "done") return state;
  if (action.type === "toggle" && state.phase === "editing") {
    if (action.idx < 0 || action.idx >= state.grid.length) return state;
    const g = state.grid.slice();
    g[action.idx] = g[action.idx] ? 0 : 1;
    return { ...state, grid: g };
  }
  if (action.type === "preset" && state.phase === "editing") {
    const { grid, nextSeed } = applyPreset(state.rngSeed, action.preset);
    return { ...state, grid, rngSeed: nextSeed };
  }
  if (action.type === "reset") {
    return { ...state, grid: emptyGrid(), generation: 0, liveSum: 0, phase: "editing" };
  }
  if (action.type === "step") {
    const ng = step(state.grid);
    const live = liveCount(ng);
    return { ...state, grid: ng, generation: state.generation + 1, liveSum: state.liveSum + live, phase: state.phase === "editing" ? "running" : state.phase };
  }
  if (action.type === "finish") {
    return { ...state, phase: "done" };
  }
  return state;
}

export function score(s: ConwayState): number { return s.liveSum + s.generation * 2; }
export function isTerminal(s: ConwayState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
