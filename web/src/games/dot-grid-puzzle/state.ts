import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DotGridPuzzleSettings {
  size: "4" | "5" | "6";
}

// A dot-connection puzzle: connect numbered dots with paths so every dot is visited exactly once
// Simplified: dots on a grid, player draws a path by clicking adjacent cells in sequence
// Goal: visit all "required" dots in a single connected path

export type CellType = "empty" | "dot" | "path" | "start" | "end";

export interface DotGridPuzzleState {
  settings: DotGridPuzzleSettings;
  rngSeed: number;
  size: number;
  grid: CellType[]; // flat array, row-major
  dots: number[];   // indices of required dot cells
  path: number[];   // player's current path (cell indices)
  solved: boolean;
  moves: number;
}

export type DotGridPuzzleAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" }
  | { type: "restart" };

function idx(size: number, row: number, col: number): number {
  return row * size + col;
}

function neighbors(size: number, i: number): number[] {
  const row = Math.floor(i / size);
  const col = i % size;
  const result: number[] = [];
  if (row > 0) result.push(idx(size, row - 1, col));
  if (row < size - 1) result.push(idx(size, row + 1, col));
  if (col > 0) result.push(idx(size, row, col - 1));
  if (col < size - 1) result.push(idx(size, row, col + 1));
  return result;
}

function generatePuzzle(seed: number, size: number): { dots: number[] } {
  const rng = mulberry32(seed);
  const total = size * size;
  // Pick 40–60% of cells as required dots (at least 4)
  const count = Math.max(4, Math.floor(total * (0.4 + rng() * 0.2)));
  const all = Array.from({ length: total }, (_, i) => i);
  // Shuffle and pick
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return { dots: all.slice(0, count).sort((a, b) => a - b) };
}

export function initialState(seed: number, settings: DotGridPuzzleSettings): DotGridPuzzleState {
  const size = parseInt(settings.size, 10);
  const { dots } = generatePuzzle(seed, size);
  const grid: CellType[] = new Array(size * size).fill("empty");
  for (const d of dots) grid[d] = "dot";
  return {
    settings,
    rngSeed: seed,
    size,
    grid,
    dots,
    path: [],
    solved: false,
    moves: 0,
  };
}

function checkSolved(path: number[], dots: number[]): boolean {
  // All dots must be in the path
  return dots.every(d => path.includes(d));
}

export function reducer(state: DotGridPuzzleState, action: DotGridPuzzleAction): DotGridPuzzleState {
  if (state.solved && action.type !== "restart") return state;

  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (action.type === "reset") {
    const grid: CellType[] = new Array(state.size * state.size).fill("empty");
    for (const d of state.dots) grid[d] = "dot";
    return { ...state, path: [], grid, moves: state.moves };
  }

  if (action.type === "clickCell") {
    const { idx: cellIdx } = { idx: action.idx };
    const { path, size } = state;

    if (path.length === 0) {
      // Start path
      const newGrid = [...state.grid] as CellType[];
      newGrid[cellIdx] = "start";
      return { ...state, path: [cellIdx], grid: newGrid, moves: state.moves + 1 };
    }

    const last = path[path.length - 1]!;

    // If clicking on last cell in path, remove it (backtrack)
    if (cellIdx === last && path.length > 1) {
      const newPath = path.slice(0, -1);
      const newGrid = [...state.grid] as CellType[];
      newGrid[last] = state.dots.includes(last) ? "dot" : "empty";
      const newLast = newPath[newPath.length - 1]!;
      newGrid[newLast] = newPath.length === 1 ? "start" : "path";
      if (state.dots.includes(newLast)) newGrid[newLast] = "path";
      return { ...state, path: newPath, grid: newGrid };
    }

    // Already in path? No revisiting
    if (path.includes(cellIdx)) return state;

    // Must be adjacent
    if (!neighbors(size, last).includes(cellIdx)) return state;

    const newPath = [...path, cellIdx];
    const newGrid = [...state.grid] as CellType[];
    newGrid[last] = "path";
    newGrid[cellIdx] = "end";

    const solved = checkSolved(newPath, state.dots);

    return {
      ...state,
      path: newPath,
      grid: newGrid,
      solved,
      moves: state.moves + 1,
    };
  }

  return state;
}

export function isTerminal(state: DotGridPuzzleState): { score: number } | null {
  if (!state.solved) return null;
  return { score: Math.max(20, 150 - state.moves * 5) };
}
