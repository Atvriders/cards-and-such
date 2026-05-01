import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// 1024: 4x4 sliding tiles. Arrow keys slide+merge tiles. Reach 1024 to win.

export const SIZE = 4;
export const TARGET = 1024;

export interface Game1024Settings { dummy: boolean; }
export type Cell = number; // 0 = empty, else power-of-2
export type Grid = Cell[][];

export interface Game1024State {
  rngSeed: number;
  grid: Grid;
  score: number;
  moves: number;
  best: number;
  phase: "playing" | "won" | "done";
}

export type Direction = "up" | "down" | "left" | "right";
export type Game1024Action = { type: "slide"; dir: Direction };

function randInt(rng: () => number, n: number): number { return Math.floor(rng() * n); }

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function spawnTile(grid: Grid, rng: () => number): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r]![c] === 0) empties.push([r, c]);
  if (empties.length === 0) return grid;
  const pick = empties[randInt(rng, empties.length)]!;
  const value = rng() < 0.9 ? 2 : 4;
  const next = grid.map(row => [...row]);
  next[pick[0]]![pick[1]] = value;
  return next;
}

function slideRowLeft(row: Cell[]): { row: Cell[]; gained: number } {
  const filtered = row.filter(v => v !== 0);
  const merged: Cell[] = [];
  let gained = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const v = filtered[i]! * 2;
      merged.push(v);
      gained += v;
      i += 2;
    } else {
      merged.push(filtered[i]!);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

function reverseRow(row: Cell[]): Cell[] { return [...row].reverse(); }

function transpose(grid: Grid): Grid {
  const out = emptyGrid();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) out[c]![r] = grid[r]![c]!;
  return out;
}

function slideGrid(grid: Grid, dir: Direction): { grid: Grid; gained: number; moved: boolean } {
  let g = grid.map(r => [...r]);
  if (dir === "up") g = transpose(g);
  if (dir === "down") g = transpose(g).map(reverseRow);
  if (dir === "right") g = g.map(reverseRow);
  let gained = 0;
  let moved = false;
  const out = g.map(row => {
    const r = slideRowLeft(row);
    gained += r.gained;
    if (r.row.some((v, i) => v !== row[i])) moved = true;
    return r.row;
  });
  let final = out;
  if (dir === "up") final = transpose(final);
  if (dir === "down") final = transpose(final.map(reverseRow));
  if (dir === "right") final = final.map(reverseRow);
  return { grid: final, gained, moved };
}

function maxTile(grid: Grid): number {
  let m = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r]![c]! > m) m = grid[r]![c]!;
  return m;
}

function hasMoves(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (grid[r]![c] === 0) return true;
    if (c + 1 < SIZE && grid[r]![c] === grid[r]![c + 1]) return true;
    if (r + 1 < SIZE && grid[r]![c] === grid[r + 1]![c]) return true;
  }
  return false;
}

export function initialState(seed: number, _settings: Game1024Settings): Game1024State {
  const rng = mulberry32(seed);
  let grid = emptyGrid();
  grid = spawnTile(grid, rng);
  grid = spawnTile(grid, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, grid, score: 0, moves: 0, best: maxTile(grid), phase: "playing" };
}

export function reducer(state: Game1024State, action: Game1024Action): Game1024State {
  if (state.phase !== "playing") return state;
  if (action.type === "slide") {
    const { grid, gained, moved } = slideGrid(state.grid, action.dir);
    if (!moved) return state;
    const rng = mulberry32(state.rngSeed);
    const next = spawnTile(grid, rng);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const best = Math.max(state.best, maxTile(next));
    let phase: "playing" | "won" | "done" = "playing";
    if (best >= TARGET && state.phase !== "won") phase = "won";
    if (!hasMoves(next)) phase = "done";
    return { ...state, rngSeed: seed2, grid: next, score: state.score + gained, moves: state.moves + 1, best, phase };
  }
  return state;
}

export function isTerminal(state: Game1024State): { score: number } | null {
  return state.phase === "done" || state.phase === "won" ? { score: state.score } : null;
}

export { slideGrid, hasMoves, maxTile };
