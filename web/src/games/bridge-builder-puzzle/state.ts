import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bridge Builder Puzzle: connect left bank to right bank by placing bridge segments
// Grid is 5 columns wide, 4 rows tall
// Some cells are blocked (rocks), player places planks to create a path

export const COLS = 7;
export const ROWS = 5;

export type CellType = "empty" | "blocked" | "start" | "end" | "plank";

export interface BridgeState {
  rngSeed: number;
  grid: CellType[][];   // [row][col]
  planksLeft: number;
  phase: "playing" | "won" | "lost";
  moves: number;
  puzzleIndex: number;
}

export type BridgeAction =
  | { type: "placeOrRemove"; row: number; col: number }
  | { type: "reset" };

function generateGrid(rng: () => number, puzzleIndex: number): CellType[][] {
  const grid: CellType[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => "empty" as CellType)
  );
  // start col=0, end col=COLS-1, random rows
  const startRow = Math.floor(rng() * ROWS);
  const endRow = Math.floor(rng() * ROWS);
  for (let r = 0; r < ROWS; r++) {
    grid[r]![0] = "empty";
    grid[r]![COLS - 1] = "empty";
  }
  grid[startRow]![0] = "start";
  grid[endRow]![COLS - 1] = "end";

  // place blocked cells (rocks) in inner columns
  const blockCount = 3 + puzzleIndex % 4;
  for (let b = 0; b < blockCount; b++) {
    const r = Math.floor(rng() * ROWS);
    const c = 1 + Math.floor(rng() * (COLS - 2));
    if (grid[r]![c] === "empty") {
      grid[r]![c] = "blocked";
    }
  }
  return grid;
}

export function initialState(seed: number): BridgeState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const grid = generateGrid(mulberry32(nextSeed), 0);
  return {
    rngSeed: nextSeed,
    grid,
    planksLeft: 8,
    phase: "playing",
    moves: 0,
    puzzleIndex: 0,
  };
}

function findPath(grid: CellType[][]): boolean {
  // BFS from start to end
  let startR = -1, startC = -1;
  let endR = -1, endC = -1;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r]![c] === "start") { startR = r; startC = c; }
      if (grid[r]![c] === "end") { endR = r; endC = c; }
    }
  }
  if (startR < 0 || endR < 0) return false;
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const queue: [number, number][] = [[startR, startC]];
  visited[startR]![startC] = true;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === endR && c === endC) return true;
    for (const [dr, dc] of dirs) {
      const nr = r + dr!;
      const nc = c + dc!;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr]![nc]) {
        const cell = grid[nr]![nc];
        if (cell !== "blocked") {
          visited[nr]![nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }
  return false;
}

export function reducer(state: BridgeState, action: BridgeAction): BridgeState {
  if (state.phase !== "playing") return state;

  if (action.type === "reset") {
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const grid = generateGrid(mulberry32(nextSeed), state.puzzleIndex + 1);
    return {
      ...state,
      rngSeed: nextSeed,
      grid,
      planksLeft: 8,
      phase: "playing",
      moves: state.moves,
      puzzleIndex: state.puzzleIndex + 1,
    };
  }

  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  const cell = state.grid[row]![col];
  if (cell === "start" || cell === "end" || cell === "blocked") return state;

  let newGrid: CellType[][];
  let newPlanks = state.planksLeft;

  if (cell === "plank") {
    // remove plank
    newGrid = state.grid.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? "empty" : c));
    newPlanks += 1;
  } else if (state.planksLeft > 0) {
    // place plank
    newGrid = state.grid.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? "plank" : c));
    newPlanks -= 1;
  } else {
    return state;
  }

  const connected = findPath(newGrid);
  const phase = connected ? "won" : (newPlanks === 0 && !findPath(newGrid)) ? "lost" : "playing";

  return {
    ...state,
    grid: newGrid,
    planksLeft: newPlanks,
    phase,
    moves: state.moves + 1,
  };
}

export function isTerminal(state: BridgeState): { score: number } | null {
  if (state.phase === "won") {
    return { score: Math.max(0, Math.min(100, 100 - state.moves * 4)) };
  }
  if (state.phase === "lost") return { score: 0 };
  return null;
}
