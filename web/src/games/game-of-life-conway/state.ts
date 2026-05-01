import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type GridSize = 8 | 12 | 16;
export const SIZE_OPTIONS: readonly GridSize[] = [8, 12, 16] as const;
export const DEFAULT_SIZE: GridSize = 12;

export type Pattern = "empty" | "glider" | "blinker" | "pulsar" | "rpentomino" | "random";
export const PATTERNS: readonly Pattern[] = ["glider", "blinker", "pulsar", "rpentomino", "random"] as const;

export interface ConwaySettings {
  size: GridSize;
}

export interface ConwayState {
  rngSeed: number;
  size: GridSize;
  grid: number[]; // length size*size, 0 or 1
  generation: number;
  maxLive: number; // peak live count across all generations
  isRunning: boolean;
  phase: "active" | "done";
}

export type ConwayAction =
  | { type: "toggle"; idx: number }
  | { type: "step" }
  | { type: "toggleRun" }
  | { type: "preset"; preset: Pattern }
  | { type: "clear" }
  | { type: "reset" }
  | { type: "finish" };

export function emptyGrid(size: number): number[] {
  return new Array(size * size).fill(0);
}

export function initialState(seed: number, s: ConwaySettings): ConwayState {
  const size = (s.size ?? DEFAULT_SIZE) as GridSize;
  return {
    rngSeed: seed,
    size,
    grid: emptyGrid(size),
    generation: 0,
    maxLive: 0,
    isRunning: false,
    phase: "active",
  };
}

function paintAt(grid: number[], size: number, r: number, c: number): void {
  if (r >= 0 && r < size && c >= 0 && c < size) grid[r * size + c] = 1;
}

export function applyPreset(seed: number, size: GridSize, preset: Pattern): { grid: number[]; nextSeed: number } {
  const grid = emptyGrid(size);
  let nextSeed = seed;
  // Center anchor
  const cr = Math.floor(size / 2);
  const cc = Math.floor(size / 2);

  if (preset === "glider") {
    // Classic glider, top-left area
    const r = 1, c = 1;
    paintAt(grid, size, r + 0, c + 1);
    paintAt(grid, size, r + 1, c + 2);
    paintAt(grid, size, r + 2, c + 0);
    paintAt(grid, size, r + 2, c + 1);
    paintAt(grid, size, r + 2, c + 2);
  } else if (preset === "blinker") {
    paintAt(grid, size, cr, cc - 1);
    paintAt(grid, size, cr, cc);
    paintAt(grid, size, cr, cc + 1);
  } else if (preset === "pulsar") {
    // Pulsar (period 3) — symmetric 13x13 footprint. Skip if board too small.
    if (size >= 13) {
      const offsets = [-6, -1, 1, 6];
      const lines = [-4, -3, -2, 2, 3, 4];
      for (const o of offsets) {
        for (const l of lines) {
          paintAt(grid, size, cr + l, cc + o);
          paintAt(grid, size, cr + o, cc + l);
        }
      }
    } else {
      // Fallback: smaller "toad" oscillator
      paintAt(grid, size, cr, cc);
      paintAt(grid, size, cr, cc + 1);
      paintAt(grid, size, cr, cc + 2);
      paintAt(grid, size, cr + 1, cc - 1);
      paintAt(grid, size, cr + 1, cc);
      paintAt(grid, size, cr + 1, cc + 1);
    }
  } else if (preset === "rpentomino") {
    paintAt(grid, size, cr - 1, cc);
    paintAt(grid, size, cr - 1, cc + 1);
    paintAt(grid, size, cr, cc - 1);
    paintAt(grid, size, cr, cc);
    paintAt(grid, size, cr + 1, cc);
  } else if (preset === "random") {
    const rng = mulberry32(seed);
    for (let i = 0; i < size * size; i++) grid[i] = rng() < 0.32 ? 1 : 0;
    nextSeed = Math.floor(rng() * 2 ** 31);
  }
  return { grid, nextSeed };
}

export function step(grid: number[], size: number): number[] {
  const next = emptyGrid(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          n += grid[nr * size + nc]!;
        }
      }
      const cur = grid[r * size + c]!;
      if (cur === 1 && (n === 2 || n === 3)) next[r * size + c] = 1;
      else if (cur === 0 && n === 3) next[r * size + c] = 1;
    }
  }
  return next;
}

export function liveCount(grid: number[]): number {
  let n = 0;
  for (const v of grid) n += v;
  return n;
}

export function reducer(state: ConwayState, action: ConwayAction): ConwayState {
  if (state.phase === "done") return state;

  if (action.type === "toggle") {
    if (state.isRunning) return state; // can't paint while auto-running
    if (action.idx < 0 || action.idx >= state.grid.length) return state;
    const g = state.grid.slice();
    g[action.idx] = g[action.idx] ? 0 : 1;
    const live = liveCount(g);
    return { ...state, grid: g, maxLive: Math.max(state.maxLive, live) };
  }

  if (action.type === "preset") {
    const { grid, nextSeed } = applyPreset(state.rngSeed, state.size, action.preset);
    const live = liveCount(grid);
    return {
      ...state,
      grid,
      rngSeed: nextSeed,
      generation: 0,
      maxLive: Math.max(state.maxLive, live),
      isRunning: false,
    };
  }

  if (action.type === "clear") {
    return { ...state, grid: emptyGrid(state.size), generation: 0, isRunning: false };
  }

  if (action.type === "reset") {
    return {
      ...state,
      grid: emptyGrid(state.size),
      generation: 0,
      maxLive: 0,
      isRunning: false,
    };
  }

  if (action.type === "step") {
    const ng = step(state.grid, state.size);
    const live = liveCount(ng);
    return {
      ...state,
      grid: ng,
      generation: state.generation + 1,
      maxLive: Math.max(state.maxLive, live),
    };
  }

  if (action.type === "toggleRun") {
    return { ...state, isRunning: !state.isRunning };
  }

  if (action.type === "finish") {
    return { ...state, phase: "done", isRunning: false };
  }

  return state;
}

export function score(s: ConwayState): number {
  return s.maxLive * Math.max(1, s.generation);
}

export function isTerminal(s: ConwayState): { score: number } | null {
  return s.phase === "done" ? { score: score(s) } : null;
}
