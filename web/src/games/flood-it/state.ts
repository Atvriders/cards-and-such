// ─── Flood It state ──────────────────────────────────────────────────────────
// 14×14 grid. Flood-fill from top-left corner. Match colors in fewest moves.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 14;

export interface FloodItSettings {
  colors: "4" | "5" | "6";
}

export interface FloodItState {
  settings: FloodItSettings;
  grid: number[][];
  moves: number;
  maxMoves: number;
  over: boolean;
  won: boolean;
  numColors: number;
}

export type FloodItAction = { type: "flood"; color: number };

function makeGrid(seed: number, numColors: number): number[][] {
  const rng = mulberry32(seed);
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => Math.floor(rng() * numColors))
  );
}

export function getFloodedRegion(grid: number[][]): Set<string> {
  const startColor = grid[0]![0]!;
  const flooded = new Set<string>();
  const queue: [number, number][] = [[0, 0]];
  flooded.add("0,0");
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue;
      const key = `${nr},${nc}`;
      if (flooded.has(key)) continue;
      if (grid[nr]![nc] === startColor) {
        flooded.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return flooded;
}

function applyFlood(grid: number[][], newColor: number): number[][] {
  const flooded = getFloodedRegion(grid);
  const next = grid.map((row) => [...row]);
  for (const key of flooded) {
    const [r, c] = key.split(",").map(Number) as [number, number];
    next[r]![c] = newColor;
  }
  return next;
}

function isBoardFlooded(grid: number[][]): boolean {
  const c = grid[0]![0]!;
  return grid.every((row) => row.every((cell) => cell === c));
}

function maxMovesFor(numColors: number): number {
  // Heuristic: more colors = more moves allowed
  return numColors === 4 ? 22 : numColors === 5 ? 26 : 30;
}

export function initialState(seed: number, settings: FloodItSettings): FloodItState {
  const numColors = parseInt(settings.colors, 10);
  const grid = makeGrid(seed, numColors);
  return {
    settings,
    grid,
    moves: 0,
    maxMoves: maxMovesFor(numColors),
    over: false,
    won: false,
    numColors,
  };
}

export function reducer(state: FloodItState, action: FloodItAction): FloodItState {
  if (state.over) return state;

  switch (action.type) {
    case "flood": {
      const { color } = action;
      const currentColor = state.grid[0]![0]!;
      if (color === currentColor) return state; // no-op

      const grid = applyFlood(state.grid, color);
      const moves = state.moves + 1;
      const won = isBoardFlooded(grid);
      const over = won || moves >= state.maxMoves;

      return { ...state, grid, moves, over, won };
    }
    default:
      return state;
  }
}

export function isTerminal(state: FloodItState): { score: number } | null {
  if (state.over) {
    const score = state.won ? Math.max(0, (state.maxMoves - state.moves) * 100 + 500) : 0;
    return { score };
  }
  return null;
}
