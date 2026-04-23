import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Connect Lights — 6×6 grid of colored lights
// Player swaps adjacent lights. If the swap creates a PATH of 3+ connected same-color lights
// (adjacency-based, not just a line), those lights are cleared and score is earned.
// Distinct from match-3: requires CONNECTED PATH (flood-fill group), not just row/col line.

export const ROWS = 6;
export const COLS = 6;
export const NUM_COLORS = 5;
export const MIN_PATH = 3;

export interface ConnectLightsSettings {
  moves: "20" | "30" | "50";
}

export type Cell = number | null; // 0..NUM_COLORS-1
export type Grid = Cell[][];

export interface ConnectLightsState {
  settings: ConnectLightsSettings;
  rngSeed: number;
  grid: Grid;
  score: number;
  movesLeft: number;
  over: boolean;
  selected: [number, number] | null;
  numColors: number;
  lastCleared: number; // how many cells cleared in last move
}

export type ConnectLightsAction =
  | { type: "select"; row: number; col: number }
  | { type: "deselect" };

// ─── RNG helpers ──────────────────────────────────────────────────────────────
function randomColor(rng: () => number): number {
  return Math.floor(rng() * NUM_COLORS);
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────
function makeGrid(seed: number): { grid: Grid; nextSeed: number } {
  const rng = mulberry32(seed);
  const grid: Grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => randomColor(rng))
  );
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { grid, nextSeed };
}

// Find all connected groups of same-color of size >= MIN_PATH using BFS
function findPathGroups(grid: Grid): Array<Array<[number, number]>> {
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const groups: Array<Array<[number, number]>> = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (visited[r]![c] || grid[r]![c] === null) continue;
      const color = grid[r]![c]!;
      const group: Array<[number, number]> = [];
      const queue: Array<[number, number]> = [[r, c]];
      visited[r]![c] = true;
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!;
        group.push([cr, cc]);
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr]![nc] && grid[nr]![nc] === color) {
            visited[nr]![nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      if (group.length >= MIN_PATH) groups.push(group);
    }
  }
  return groups;
}

function applyGravity(grid: Grid): Grid {
  const next = grid.map((r) => [...r]);
  for (let c = 0; c < COLS; c++) {
    const gems: Cell[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r]![c] !== null) gems.push(next[r]![c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r]![c] = gems.length > 0 ? (gems.shift() ?? null) : null;
    }
  }
  return next;
}

function fillEmpty(grid: Grid, rng: () => number): Grid {
  const next = grid.map((r) => [...r]);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r]![c] === null) next[r]![c] = randomColor(rng);
    }
  }
  return next;
}

function clearGroups(grid: Grid, groups: Array<Array<[number, number]>>): { newGrid: Grid; cleared: number } {
  const next = grid.map((r) => [...r]);
  let cleared = 0;
  for (const group of groups) {
    for (const [r, c] of group) {
      next[r]![c] = null;
      cleared++;
    }
  }
  return { newGrid: next, cleared };
}

function scoreForGroup(size: number): number {
  if (size === 3) return 15;
  if (size === 4) return 40;
  if (size === 5) return 100;
  return 100 + (size - 5) * 60;
}

// ─── Initial state ─────────────────────────────────────────────────────────────
export function initialState(seed: number, settings: ConnectLightsSettings): ConnectLightsState {
  const movesLeft = parseInt(settings.moves);
  const { grid, nextSeed } = makeGrid(seed);
  return {
    settings,
    rngSeed: nextSeed,
    grid,
    score: 0,
    movesLeft,
    over: false,
    selected: null,
    numColors: NUM_COLORS,
    lastCleared: 0,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function reducer(state: ConnectLightsState, action: ConnectLightsAction): ConnectLightsState {
  if (state.over) return state;

  switch (action.type) {
    case "deselect":
      return { ...state, selected: null };

    case "select": {
      const { row, col } = action;
      if (state.grid[row]?.[col] === null) return state;

      if (!state.selected) {
        return { ...state, selected: [row, col] };
      }

      const [sr, sc] = state.selected;
      if (sr === row && sc === col) {
        return { ...state, selected: null };
      }

      const dr = Math.abs(row - sr);
      const dc = Math.abs(col - sc);
      const isAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);

      if (!isAdjacent) {
        return { ...state, selected: [row, col] };
      }

      // Try swap
      const newGrid = state.grid.map((r) => [...r]);
      const tmp = newGrid[sr]![sc];
      newGrid[sr]![sc] = newGrid[row]![col]!;
      newGrid[row]![col] = tmp!;

      // Check if swap creates any path-connected group of 3+
      const groups = findPathGroups(newGrid);
      if (groups.length === 0) {
        // No valid path — revert
        return { ...state, selected: null };
      }

      // Valid: clear groups, apply gravity, fill
      const { newGrid: cleared, cleared: numCleared } = clearGroups(newGrid, groups);
      let points = groups.reduce((sum, g) => sum + scoreForGroup(g.length), 0);

      const rng = mulberry32(state.rngSeed);
      let afterGravity = applyGravity(cleared);
      afterGravity = fillEmpty(afterGravity, rng);

      // Check cascades
      let cascade = 1;
      let cascadePoints = 0;
      while (true) {
        const cascadeGroups = findPathGroups(afterGravity);
        if (cascadeGroups.length === 0) break;
        cascade++;
        const { newGrid: cascadeCleared, cleared: cascadeCleared_ } = clearGroups(afterGravity, cascadeGroups);
        cascadePoints += cascadeGroups.reduce((sum, g) => sum + scoreForGroup(g.length), 0) * cascade;
        afterGravity = applyGravity(cascadeCleared);
        afterGravity = fillEmpty(afterGravity, rng);
        void cascadeCleared_; // unused
      }

      points += cascadePoints;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const movesLeft = state.movesLeft - 1;

      return {
        ...state,
        grid: afterGravity,
        score: state.score + points,
        movesLeft,
        over: movesLeft <= 0,
        selected: null,
        rngSeed: nextSeed,
        lastCleared: numCleared,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ConnectLightsState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findPathGroups, makeGrid };
