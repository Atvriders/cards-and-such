import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TileFlipSettings {
  size: "3" | "4" | "5";
}

export interface TileFlipState {
  settings: TileFlipSettings;
  size: number;
  // Each cell has a value 0..3 (color)
  grid: readonly number[];
  target: readonly number[];
  movesMade: number;
  won: boolean;
}

export type TileFlipAction = { type: "flip"; row: number; col: number };

const NUM_COLORS = 4;

export function initialState(seed: number, settings: TileFlipSettings): TileFlipState {
  const size = parseInt(settings.size, 10);
  const rng = mulberry32(seed);
  const cells = size * size;

  // Generate a random target pattern
  const target = Array.from({ length: cells }, () => Math.floor(rng() * NUM_COLORS));
  // Start with a scrambled grid (random from target by applying random flips)
  const grid = target.slice();

  // Apply random flips to scramble
  const scrambles = 5 + Math.floor(rng() * 10);
  for (let i = 0; i < scrambles; i++) {
    const r = Math.floor(rng() * size);
    const c = Math.floor(rng() * size);
    applyFlip(grid, size, r, c);
  }

  // Make sure grid differs from target
  const differs = grid.some((v, i) => v !== target[i]);
  if (!differs) {
    applyFlip(grid, size, 0, 0);
  }

  return {
    settings,
    size,
    grid,
    target,
    movesMade: 0,
    won: false,
  };
}

function applyFlip(grid: number[], size: number, row: number, col: number): void {
  const idx = row * size + col;
  grid[idx] = (grid[idx]! + 1) % NUM_COLORS;
  if (row > 0) {
    const i = (row - 1) * size + col;
    grid[i] = (grid[i]! + 1) % NUM_COLORS;
  }
  if (row < size - 1) {
    const i = (row + 1) * size + col;
    grid[i] = (grid[i]! + 1) % NUM_COLORS;
  }
  if (col > 0) {
    const i = row * size + (col - 1);
    grid[i] = (grid[i]! + 1) % NUM_COLORS;
  }
  if (col < size - 1) {
    const i = row * size + (col + 1);
    grid[i] = (grid[i]! + 1) % NUM_COLORS;
  }
}

export function reducer(state: TileFlipState, action: TileFlipAction): TileFlipState {
  if (action.type !== "flip") return state;
  if (state.won) return state;

  const { row, col } = action;
  if (row < 0 || row >= state.size || col < 0 || col >= state.size) return state;

  const grid = state.grid.slice();
  applyFlip(grid, state.size, row, col);
  const won = grid.every((v, i) => v === state.target[i]);

  return {
    ...state,
    grid,
    movesMade: state.movesMade + 1,
    won,
  };
}

export function isTerminal(state: TileFlipState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 20) };
}
