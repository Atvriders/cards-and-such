import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Merge Dragons Mini: 5x5 merge board. Place a tile; three-of-a-kind in adjacent cells merges into a tier-up tile.

export const SIZE = 5;
export const MAX_TIER = 7;
export const MAX_MOVES = 60;

export interface MergeDragonsMiniSettings { dummy: boolean; }
export type Cell = number; // 0 = empty, 1..MAX_TIER tiers
export type Grid = Cell[][];

export interface MergeDragonsMiniState {
  rngSeed: number;
  grid: Grid;
  next: Cell;
  score: number;
  movesUsed: number;
  best: number;
  phase: "playing" | "done";
}

export type MergeDragonsMiniAction = { type: "place"; row: number; col: number };

function randNext(rng: () => number): Cell {
  const r = rng();
  if (r < 0.55) return 1;
  if (r < 0.85) return 2;
  return 3;
}

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function flood(grid: Grid, r: number, c: number, tier: number): [number, number][] {
  const seen = new Set<string>();
  const stack: [number, number][] = [[r, c]];
  const cells: [number, number][] = [];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const key = `${cr},${cc}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (cr < 0 || cc < 0 || cr >= SIZE || cc >= SIZE) continue;
    if (grid[cr]![cc] !== tier) continue;
    cells.push([cr, cc]);
    stack.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
  }
  return cells;
}

function resolveMerge(grid: Grid, r: number, c: number): { grid: Grid; gained: number } {
  let cur = grid.map(row => [...row]);
  let gained = 0;
  while (true) {
    const tier = cur[r]![c]!;
    if (tier <= 0 || tier >= MAX_TIER) break;
    const group = flood(cur, r, c, tier);
    if (group.length < 3) break;
    for (const [gr, gc] of group) cur[gr]![gc] = 0;
    cur[r]![c] = tier + 1;
    gained += (tier + 1) * group.length * 5;
  }
  return { grid: cur, gained };
}

function maxTier(grid: Grid): number {
  let m = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r]![c]! > m) m = grid[r]![c]!;
  return m;
}

function hasEmpty(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r]![c] === 0) return true;
  return false;
}

export function initialState(seed: number, _settings: MergeDragonsMiniSettings): MergeDragonsMiniState {
  const rng = mulberry32(seed);
  const next = randNext(rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  return { rngSeed: seed2, grid: emptyGrid(), next, score: 0, movesUsed: 0, best: 0, phase: "playing" };
}

export function reducer(state: MergeDragonsMiniState, action: MergeDragonsMiniAction): MergeDragonsMiniState {
  if (state.phase === "done") return state;
  if (action.type === "place") {
    const { row, col } = action;
    if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) return state;
    if (state.grid[row]![col] !== 0) return state;
    const grid = state.grid.map(r => [...r]);
    grid[row]![col] = state.next;
    const merged = resolveMerge(grid, row, col);
    const rng = mulberry32(state.rngSeed);
    const next = randNext(rng);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const movesUsed = state.movesUsed + 1;
    const best = Math.max(state.best, maxTier(merged.grid));
    const done = !hasEmpty(merged.grid) || movesUsed >= MAX_MOVES;
    return { ...state, rngSeed: seed2, grid: merged.grid, next, score: state.score + 5 + merged.gained, movesUsed, best, phase: done ? "done" : "playing" };
  }
  return state;
}

export function isTerminal(state: MergeDragonsMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

export { resolveMerge, maxTier };
