import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Fox and Geese — 33-hole plus-shaped board
// 1 Fox (player) vs 13 Geese (bot, fills top rows)
// Fox captures by jumping over a goose to an empty cell (like draughts)
// Geese cannot capture; they just block and surround the fox
// Fox wins: capture all geese; Geese win: surround the fox so it can't move
// Movement: all pieces move one step; Fox can move in any direction; Geese move forward and sideways only (not back)
// Board: classic 33-hole cross / plus shape

// We use a 7×7 grid with a plus mask
// Plus shape: rows 0-2 columns 2-4, row 3 columns 0-6, rows 4-6 columns 2-4
// Starting: Fox at centre (3,3); Geese fill rows 0-2 (9+3+3 = 15 but actually start in 2 top rows = 13 in standard variant)
// We'll use 13 geese in rows 0-2 of the valid plus cells

export const BOARD_SIZE = 7;

const VALID_CELLS: Set<string> = new Set();
for (let r = 0; r < BOARD_SIZE; r++) {
  for (let c = 0; c < BOARD_SIZE; c++) {
    const inCross =
      (r >= 0 && r <= 2 && c >= 2 && c <= 4) ||
      (r === 3) ||
      (r >= 4 && r <= 6 && c >= 2 && c <= 4);
    if (inCross) VALID_CELLS.add(`${r},${c}`);
  }
}

export function isValid(r: number, c: number): boolean {
  return VALID_CELLS.has(`${r},${c}`);
}

export type BoardCell = "fox" | "goose" | null;
export type Grid = BoardCell[][];

export interface FoxGeeseSettings {
  opponent: "bot";
}

export interface FoxGeeseState {
  settings: FoxGeeseSettings;
  rngSeed: number;
  grid: Grid;
  selected: [number, number] | null;
  winner: "fox" | "geese" | null;
  // Whose turn: "fox" = player, "geese" = bot
  turn: "fox" | "geese";
}

export type FoxGeeseAction =
  | { type: "select"; row: number; col: number }
  | { type: "move"; row: number; col: number };

function makeEmptyGrid(): Grid {
  return Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(null) as BoardCell[]);
}

export function initialState(seed: number, settings: FoxGeeseSettings): FoxGeeseState {
  const grid = makeEmptyGrid();

  // Fox at centre
  grid[3]![3] = "fox";

  // 13 Geese: rows 0-2 valid cells
  const geeseCells: [number, number][] = [];
  for (let r = 0; r <= 2; r++) {
    for (let c = 2; c <= 4; c++) {
      geeseCells.push([r, c]);
    }
  }
  // Row 3 side cells
  geeseCells.push([3, 0], [3, 1]);
  // = 9 + 2 = 11 cells, add row 3 cols 5,6 = 13
  geeseCells.push([3, 5], [3, 6]);

  for (const [r, c] of geeseCells) {
    grid[r]![c] = "goose";
  }

  return {
    settings,
    rngSeed: seed,
    grid,
    selected: null,
    winner: null,
    turn: "fox",
  };
}

// ----- Adjacency -----

const ALL8: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

// Geese can only move forward (increasing row) and sideways on valid cells
const GEESE_DIRS: [number, number][] = [
  [1, 0], [0, -1], [0, 1],
];

export type FoxMove =
  | { kind: "step"; from: [number, number]; to: [number, number] }
  | { kind: "jump"; from: [number, number]; over: [number, number]; to: [number, number] };

export function foxMoves(grid: Grid, from: [number, number]): FoxMove[] {
  const [fr, fc] = from;
  const moves: FoxMove[] = [];

  for (const [dr, dc] of ALL8) {
    const nr = fr + dr; const nc = fc + dc;
    if (!isValid(nr, nc)) continue;
    const target = grid[nr]?.[nc];
    if (target === null) {
      moves.push({ kind: "step", from, to: [nr, nc] });
    } else if (target === "goose") {
      // Jump
      const lr = nr + dr; const lc = nc + dc;
      if (isValid(lr, lc) && grid[lr]?.[lc] === null) {
        moves.push({ kind: "jump", from, over: [nr, nc], to: [lr, lc] });
      }
    }
  }
  return moves;
}

export function gooseMoves(grid: Grid): Array<{ from: [number, number]; to: [number, number] }> {
  const moves: Array<{ from: [number, number]; to: [number, number] }> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (grid[r]?.[c] !== "goose") continue;
      for (const [dr, dc] of GEESE_DIRS) {
        const nr = r + dr; const nc = c + dc;
        if (isValid(nr, nc) && grid[nr]?.[nc] === null) {
          moves.push({ from: [r, c], to: [nr, nc] });
        }
      }
    }
  }
  return moves;
}

function countGeese(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (grid[r]?.[c] === "goose") count++;
    }
  }
  return count;
}

function findFox(grid: Grid): [number, number] | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (grid[r]?.[c] === "fox") return [r, c];
    }
  }
  return null;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function runBot(state: FoxGeeseState): FoxGeeseState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = gooseMoves(state.grid);
  if (moves.length === 0) {
    // No geese moves — fox wins (or draw; here fox wins)
    return { ...state, rngSeed: nextSeed, winner: "fox" };
  }
  const move = moves[Math.floor(rng() * moves.length)]!;
  const newGrid = cloneGrid(state.grid);
  newGrid[move.from[0]]![move.from[1]] = null;
  newGrid[move.to[0]]![move.to[1]] = "goose";

  // Check if fox is now surrounded
  const foxPos = findFox(newGrid);
  let winner: "fox" | "geese" | null = null;
  if (foxPos) {
    const fMoves = foxMoves(newGrid, foxPos);
    if (fMoves.length === 0) winner = "geese";
  }

  return {
    ...state,
    rngSeed: nextSeed,
    grid: newGrid,
    turn: "fox",
    selected: null,
    winner,
  };
}

export function reducer(state: FoxGeeseState, action: FoxGeeseAction): FoxGeeseState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== "fox") return state;
    const { row, col } = action;
    if (state.grid[row]?.[col] !== "fox") return state;
    return { ...state, selected: [row, col] };
  }

  if (action.type === "move") {
    if (state.turn !== "fox" || state.selected === null) return state;
    const { row, col } = action;
    const moves = foxMoves(state.grid, state.selected);
    const match = moves.find((m) => m.to[0] === row && m.to[1] === col);
    if (!match) return state;

    const newGrid = cloneGrid(state.grid);
    newGrid[state.selected[0]]![state.selected[1]] = null;
    if (match.kind === "jump") {
      newGrid[match.over[0]]![match.over[1]] = null;
    }
    newGrid[row]![col] = "fox";

    const geeseLeft = countGeese(newGrid);
    if (geeseLeft === 0) {
      return { ...state, grid: newGrid, winner: "fox", selected: null };
    }

    const afterFox: FoxGeeseState = {
      ...state,
      grid: newGrid,
      turn: "geese",
      selected: null,
    };

    return runBot(afterFox);
  }

  return state;
}

export function isTerminal(state: FoxGeeseState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "fox" ? 20 : 0 };
}
