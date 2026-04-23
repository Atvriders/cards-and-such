import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Don't Break the Ice — 4×4 grid of ice cubes
// The penguin rests on 4 "support" cubes (inner 2×2 center).
// Player and bot alternate removing cubes.
// If all 4 support cubes are removed, the penguin falls.
// The player who removes the last support cube loses.

export const GRID_ROWS = 4;
export const GRID_COLS = 4;
export const TOTAL_CUBES = GRID_ROWS * GRID_COLS; // 16

// Support cubes: inner 2×2 (rows 1-2, cols 1-2 in 0-indexed)
export const SUPPORT_POSITIONS: Array<[number, number]> = [
  [1, 1], [1, 2], [2, 1], [2, 2],
];

function isSupportCube(row: number, col: number): boolean {
  return SUPPORT_POSITIONS.some(([r, c]) => r === row && c === col);
}

export interface DontBreakState {
  rngSeed: number;
  // grid[r][c] = true means cube still present
  grid: readonly (readonly boolean[])[];
  turn: 0 | 1; // 0 = player, 1 = bot
  supportRemaining: number; // how many of the 4 support cubes are still in grid
  cubesRemaining: number;
  loser: 0 | 1 | null;
  lastRemoved: [number, number] | null;
  message: string;
}

export type DontBreakAction = { type: "remove"; row: number; col: number };

export interface DontBreakSettings {
  dummy: "yes";
}

export function initialState(seed: number, _settings: DontBreakSettings): DontBreakState {
  const grid: boolean[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => true)
  );
  return {
    rngSeed: seed,
    grid,
    turn: 0,
    supportRemaining: 4,
    cubesRemaining: TOTAL_CUBES,
    loser: null,
    lastRemoved: null,
    message: "Tap a cube to remove it! Avoid the 4 center (support) cubes!",
  };
}

function removeCube(state: DontBreakState, row: number, col: number): DontBreakState {
  if (!state.grid[row]?.[col]) return state;
  const newGrid = state.grid.map((r, ri) =>
    ri === row ? r.map((c, ci) => (ci === col ? false : c)) : r
  );
  const wasSupport = isSupportCube(row, col);
  const newSupport = state.supportRemaining - (wasSupport ? 1 : 0);
  const newCubes = state.cubesRemaining - 1;
  const loser = newSupport === 0 ? state.turn : null;
  return {
    ...state,
    grid: newGrid,
    supportRemaining: newSupport,
    cubesRemaining: newCubes,
    loser,
    lastRemoved: [row, col],
  };
}

function botMove(state: DontBreakState): DontBreakState {
  // Bot tries to avoid support cubes; picks a random non-support cube if possible
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const available: Array<[number, number]> = [];
  const safeAvailable: Array<[number, number]> = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (state.grid[r]![c]) {
        available.push([r, c]);
        if (!isSupportCube(r, c)) safeAvailable.push([r, c]);
      }
    }
  }

  const pool = safeAvailable.length > 0 ? safeAvailable : available;
  const rng2 = mulberry32(nextSeed);
  const idx = Math.floor(rng2() * pool.length);
  const nextSeed2 = Math.floor(rng2() * 2 ** 31);
  const [row, col] = pool[idx]!;

  const after = removeCube({ ...state, rngSeed: nextSeed2 }, row, col);
  const was = isSupportCube(row, col) ? " (support!)" : "";
  const msg = after.loser === 1
    ? `Bot removed [${row + 1},${col + 1}]${was} — penguin falls! Bot loses!`
    : `Bot removed [${row + 1},${col + 1}]${was}. Your turn.`;
  return { ...after, turn: 0, message: msg };
}

export function reducer(state: DontBreakState, action: DontBreakAction): DontBreakState {
  if (state.loser !== null) return state;
  if (action.type !== "remove") return state;
  if (state.turn !== 0) return state;

  const { row, col } = action;
  if (!state.grid[row]?.[col]) return state;

  const after = removeCube(state, row, col);
  if (after.loser === 0) {
    return { ...after, message: `You removed [${row + 1},${col + 1}] — penguin falls! You lose!` };
  }

  const was = isSupportCube(row, col) ? " (support!)" : "";
  const next: DontBreakState = {
    ...after,
    turn: 1,
    message: `You removed [${row + 1},${col + 1}]${was}. Bot's turn…`,
  };

  // Bot takes turn immediately
  return botMove(next);
}

export function isTerminal(state: DontBreakState): { score: number } | null {
  if (state.loser === null) return null;
  return { score: state.loser === 0 ? 0 : 100 };
}

export { isSupportCube };
