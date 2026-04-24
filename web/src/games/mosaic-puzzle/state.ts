import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { MosaicPuzzle } from "./puzzles.js";

export type { MosaicPuzzle };

export interface MosaicSettings {
  difficulty: "easy" | "hard";
}

// 0 = unknown, 1 = white, 2 = black
export interface MosaicState {
  settings: MosaicSettings;
  puzzle: MosaicPuzzle;
  cells: number[];
  won: boolean;
  moves: number;
}

export type MosaicAction =
  | { type: "toggleCell"; idx: number }
  | { type: "reset" };

/** Count black cells in 3×3 neighbourhood of (r,c) given current cells array */
export function countNeighbourhood(cells: number[], size: number, r: number, c: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (cells[nr * size + nc] === 2) count++;
    }
  }
  return count;
}

export function checkWon(puzzle: MosaicPuzzle, cells: number[]): boolean {
  const { size, clues, solution } = puzzle;
  // All cells must be assigned (1 or 2)
  if (cells.some(v => v === 0)) return false;
  // Cell assignments must match solution
  for (let i = 0; i < size * size; i++) {
    const isBlack = cells[i] === 2;
    if (isBlack !== solution[i]) return false;
  }
  // Clue constraints
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const clue = clues[r * size + c];
      if (clue === null) continue;
      if (countNeighbourhood(cells, size, r, c) !== clue) return false;
    }
  }
  return true;
}

export function initialState(seed: number, settings: MosaicSettings): MosaicState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    cells: new Array(puzzle.size * puzzle.size).fill(0),
    won: false,
    moves: 0,
  };
}

export function reducer(state: MosaicState, action: MosaicAction): MosaicState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleCell": {
      const { idx } = action;
      const cells = state.cells.slice();
      // Cycle: unknown -> white -> black -> unknown
      cells[idx] = ((cells[idx] ?? 0) + 1) % 3;
      const won = checkWon(state.puzzle, cells);
      return { ...state, cells, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        cells: new Array(state.puzzle.size * state.puzzle.size).fill(0),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: MosaicState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
