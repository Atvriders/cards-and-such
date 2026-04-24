// ─── Color Lines state ────────────────────────────────────────────────────────
// 9×9 grid. Move colored balls to form lines of 5+. Each turn spawns 3 new balls.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_SIZE = 9;
export const LINE_LENGTH = 5;
export const SPAWN_COUNT = 3;
export const NUM_COLORS = 7;

export type Cell = number | null; // 0..NUM_COLORS-1 or empty

export interface ColorLinesSettings {
  size: "7" | "9";
}

export interface ColorLinesState {
  settings: ColorLinesSettings;
  grid: Cell[];
  score: number;
  over: boolean;
  selected: number | null; // selected cell index
  nextColors: number[]; // preview of next 3 spawns
  rngState: number;
}

export type ColorLinesAction =
  | { type: "select"; idx: number }
  | { type: "move"; idx: number };

const DIRS: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function idx(r: number, c: number, size: number): number { return r * size + c; }
function row(i: number, size: number): number { return Math.floor(i / size); }
function col(i: number, size: number): number { return i % size; }

export function findPath(grid: Cell[], from: number, to: number, size: number): number[] | null {
  if (grid[to] !== null) return null;
  const visited = new Set<number>();
  const prev = new Map<number, number>();
  const queue = [from];
  visited.add(from);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === to) {
      // Reconstruct path
      const path: number[] = [];
      let node = to;
      while (node !== from) { path.push(node); node = prev.get(node)!; }
      path.push(from);
      return path.reverse();
    }
    const r = row(cur, size), c = col(cur, size);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const ni = idx(nr, nc, size);
      if (visited.has(ni)) continue;
      if (grid[ni] !== null) continue;
      visited.add(ni);
      prev.set(ni, cur);
      queue.push(ni);
    }
  }
  return null;
}

export function checkLines(grid: Cell[], size: number): { newGrid: Cell[]; points: number } {
  const toRemove = new Set<number>();

  // Check horizontal, vertical, diagonal (\), anti-diagonal (/)
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const color = grid[idx(r, c, size)];
      if (color === null) continue;
      for (const [dr, dc] of directions) {
        const cells: number[] = [];
        let nr = r, nc = c;
        while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[idx(nr, nc, size)] === color) {
          cells.push(idx(nr, nc, size));
          nr += dr; nc += dc;
        }
        if (cells.length >= LINE_LENGTH) cells.forEach((i) => toRemove.add(i));
      }
    }
  }

  if (toRemove.size === 0) return { newGrid: grid, points: 0 };
  const newGrid = [...grid];
  for (const i of toRemove) newGrid[i] = null;
  const points = toRemove.size * 10;
  return { newGrid, points };
}

function spawnBalls(grid: Cell[], colors: number[], rng: () => number, size: number): { grid: Cell[]; over: boolean } {
  const empty: number[] = [];
  for (let i = 0; i < size * size; i++) if (grid[i] === null) empty.push(i);
  if (empty.length === 0) return { grid, over: true };
  const newGrid = [...grid];
  const count = Math.min(SPAWN_COUNT, empty.length);
  const shuffled = empty.slice().sort(() => rng() - 0.5);
  for (let i = 0; i < count; i++) newGrid[shuffled[i]!] = colors[i] ?? 0;
  const over = newGrid.every((c) => c !== null);
  return { grid: newGrid, over };
}

function nextColorSet(rng: () => number): number[] {
  return Array.from({ length: SPAWN_COUNT }, () => Math.floor(rng() * NUM_COLORS));
}

function makeRng(seed: number): { rng: () => number; state: number } {
  // Use mulberry32; capture state by re-seeding
  let s = seed >>> 0;
  const rng = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
  return { rng, state: s };
}

export function initialState(seed: number, settings: ColorLinesSettings): ColorLinesState {
  const size = parseInt(settings.size, 10);
  const { rng } = makeRng(seed);
  const grid: Cell[] = Array(size * size).fill(null);
  const firstColors = nextColorSet(rng);
  const { grid: g1 } = spawnBalls(grid, firstColors, rng, size);
  const { grid: g2 } = spawnBalls(g1, nextColorSet(rng), rng, size);
  const preview = nextColorSet(rng);
  return {
    settings,
    grid: g2,
    score: 0,
    over: false,
    selected: null,
    nextColors: preview,
    rngState: seed + 13,
  };
}

export function reducer(state: ColorLinesState, action: ColorLinesAction): ColorLinesState {
  if (state.over) return state;
  const size = parseInt(state.settings.size, 10);

  switch (action.type) {
    case "select": {
      const { idx: i } = action;
      if (state.grid[i] !== null) return { ...state, selected: i };
      return state;
    }
    case "move": {
      const { idx: to } = action;
      if (state.selected === null) return state;
      const from = state.selected;
      if (from === to) return { ...state, selected: null };
      const path = findPath(state.grid, from, to, size);
      if (!path) return { ...state, selected: null };

      // Move ball
      let grid = [...state.grid];
      grid[to] = grid[from] ?? null;
      grid[from] = null;

      // Check lines
      const { newGrid, points } = checkLines(grid, size);
      grid = newGrid;

      if (points > 0) {
        // Lines cleared — no spawn
        const over = grid.every((c) => c !== null);
        return { ...state, grid, score: state.score + points, selected: null, over };
      }

      // Spawn new balls
      const { rng } = makeRng(state.rngState);
      const { grid: spawnedGrid, over } = spawnBalls(grid, state.nextColors, rng, size);
      const preview = nextColorSet(rng);

      return {
        ...state,
        grid: spawnedGrid,
        score: state.score,
        selected: null,
        nextColors: preview,
        rngState: state.rngState + 7,
        over,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: ColorLinesState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
