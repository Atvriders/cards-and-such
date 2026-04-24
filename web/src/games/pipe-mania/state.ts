// ─── Pipe Mania state ─────────────────────────────────────────────────────────
// 7×7 grid. Drag pipe pieces from queue onto grid. Water flows from source.
// Score = number of pipe segments flooded before leaking.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 7;
export const ROWS = 7;

// Pipe shapes: bitmask N=1, E=2, S=4, W=8
export type PipeType =
  | "NS"   // straight vertical
  | "EW"   // straight horizontal
  | "NE"   // curve
  | "NW"   // curve
  | "SE"   // curve
  | "SW"   // curve
  | "NESW" // cross
  | "source";

export const PIPE_OPENINGS: Record<PipeType, { N: boolean; E: boolean; S: boolean; W: boolean }> = {
  NS:     { N: true,  E: false, S: true,  W: false },
  EW:     { N: false, E: true,  S: false, W: true  },
  NE:     { N: true,  E: true,  S: false, W: false },
  NW:     { N: true,  E: false, S: false, W: true  },
  SE:     { N: false, E: true,  S: true,  W: false },
  SW:     { N: false, E: false, S: true,  W: true  },
  NESW:   { N: true,  E: true,  S: true,  W: true  },
  source: { N: true,  E: true,  S: true,  W: true  },
};

const PIPE_TYPES: PipeType[] = ["NS", "EW", "NE", "NW", "SE", "SW", "NESW"];

export interface PipeCell {
  type: PipeType | null;
  flooded: boolean;
}

export interface PipeManiaSettings {
  size: "5" | "7";
}

export interface PipeManiaState {
  settings: PipeManiaSettings;
  grid: PipeCell[][];
  queue: PipeType[];
  sourceRow: number;
  sourceDir: "E" | "S";
  floodPath: [number, number][];
  floodTick: number;
  over: boolean;
  score: number;
  rngState: number;
}

export type PipeManiaAction =
  | { type: "place"; row: number; col: number }
  | { type: "tick" };

function makeQueue(rng: () => number, count: number): PipeType[] {
  return Array.from({ length: count }, () => PIPE_TYPES[Math.floor(rng() * PIPE_TYPES.length)]!);
}

export function initialState(seed: number, settings: PipeManiaSettings): PipeManiaState {
  const size = parseInt(settings.size, 10) as 5 | 7;
  const cols = size, rows = size;
  const rng = mulberry32(seed);
  const sourceRow = Math.floor(rng() * rows);

  const grid: PipeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: null, flooded: false }))
  );
  grid[sourceRow]![0] = { type: "source", flooded: false };

  return {
    settings,
    grid,
    queue: makeQueue(rng, 5),
    sourceRow,
    sourceDir: "E",
    floodPath: [],
    floodTick: 0,
    over: false,
    score: 0,
    rngState: seed + 1,
  };
}

function opposite(dir: "N" | "E" | "S" | "W"): "N" | "E" | "S" | "W" {
  return dir === "N" ? "S" : dir === "S" ? "N" : dir === "E" ? "W" : "E";
}
function dirOffset(dir: "N" | "E" | "S" | "W"): [number, number] {
  return dir === "N" ? [-1, 0] : dir === "S" ? [1, 0] : dir === "E" ? [0, 1] : [0, -1];
}

function advanceFlood(state: PipeManiaState): PipeManiaState {
  const rows = state.grid.length;
  const cols = state.grid[0]!.length;
  const path = state.floodPath;

  if (path.length === 0) {
    // Start flood from source
    const sr = state.sourceRow, sc = 0;
    const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[sr]![sc]!.flooded = true;
    // Try to flow East from source
    return { ...state, grid: newGrid, floodPath: [[sr, sc]], floodTick: 1 };
  }

  const [lr, lc] = path[path.length - 1]!;
  const cell = state.grid[lr]![lc]!;
  if (!cell.type) return { ...state, over: true };

  // Find direction to flow out
  const dirs: ("N" | "E" | "S" | "W")[] = ["N", "E", "S", "W"];
  let flowing: ("N" | "E" | "S" | "W") | null = null;

  // Determine entry direction
  let entryDir: "N" | "E" | "S" | "W" | null = null;
  if (path.length >= 2) {
    const [pr, pc] = path[path.length - 2]!;
    const dr = lr - pr, dc = lc - pc;
    entryDir = dr === -1 ? "N" : dr === 1 ? "S" : dc === 1 ? "E" : "W";
  } else {
    entryDir = "W"; // from left of source
  }

  const openings = PIPE_OPENINGS[cell.type];
  for (const d of dirs) {
    if (d === opposite(entryDir)) continue; // can't flow back
    if (openings[d]) { flowing = d; break; }
  }

  if (!flowing) return { ...state, over: true };

  const [dr, dc] = dirOffset(flowing);
  const nr = lr + dr, nc = lc + dc;

  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
    return { ...state, over: true, score: path.length };
  }

  const nextCell = state.grid[nr]![nc]!;
  if (!nextCell.type) {
    // No pipe placed — leak
    return { ...state, over: true, score: path.length };
  }

  // Check that next cell accepts flow from opposite
  const nextOpenings = PIPE_OPENINGS[nextCell.type];
  if (!nextOpenings[opposite(flowing)]) {
    return { ...state, over: true, score: path.length };
  }

  if (nextCell.flooded) {
    // Loop — end
    return { ...state, over: true, score: path.length };
  }

  const newGrid = state.grid.map((r) => r.map((c) => ({ ...c })));
  newGrid[nr]![nc]!.flooded = true;

  const newPath = [...path, [nr, nc] as [number, number]];
  const allFlooded = newGrid.every((row) => row.every((c) => c.flooded));
  if (allFlooded) {
    return { ...state, grid: newGrid, floodPath: newPath, over: true, score: newPath.length };
  }

  return { ...state, grid: newGrid, floodPath: newPath, floodTick: state.floodTick + 1 };
}

export function reducer(state: PipeManiaState, action: PipeManiaAction): PipeManiaState {
  if (state.over) return state;

  switch (action.type) {
    case "place": {
      const { row, col } = action;
      if (!state.queue.length) return state;
      const rows = state.grid.length;
      const cols = state.grid[0]!.length;
      if (row < 0 || row >= rows || col < 0 || col >= cols) return state;
      if (state.grid[row]![col]!.type === "source") return state;
      if (state.grid[row]![col]!.flooded) return state; // can't replace flooded

      const [next, ...rest] = state.queue;
      const rng = mulberry32(state.rngState);
      const newPipe = PIPE_TYPES[Math.floor(rng() * PIPE_TYPES.length)]!;

      const grid = state.grid.map((r) => r.map((c) => ({ ...c })));
      grid[row]![col] = { type: next!, flooded: false };

      return { ...state, grid, queue: [...rest, newPipe], rngState: state.rngState + 3 };
    }
    case "tick": {
      const newState = advanceFlood(state);
      return newState;
    }
    default:
      return state;
  }
}

export function isTerminal(state: PipeManiaState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
