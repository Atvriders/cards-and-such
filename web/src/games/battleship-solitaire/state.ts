import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { BSPuzzle } from "./puzzles.js";

export type { BSPuzzle };

export interface BSSettings {
  difficulty: "easy" | "medium";
}

// Player mark: null=unmarked, true=ship, false=water
export interface BSState {
  settings: BSSettings;
  puzzle: BSPuzzle;
  /** Player marks; mirrors revealed for pre-revealed cells */
  marks: (boolean | null)[];
  won: boolean;
  moves: number;
}

export type BSAction =
  | { type: "mark"; idx: number; value: boolean | null }
  | { type: "reset" };

export function computeRowCounts(size: number, marks: (boolean | null)[]): number[] {
  return Array.from({ length: size }, (_, r) => {
    let count = 0;
    for (let c = 0; c < size; c++) { if (marks[r * size + c] === true) count++; }
    return count;
  });
}

export function computeColCounts(size: number, marks: (boolean | null)[]): number[] {
  return Array.from({ length: size }, (_, c) => {
    let count = 0;
    for (let r = 0; r < size; r++) { if (marks[r * size + c] === true) count++; }
    return count;
  });
}

export function checkWon(puzzle: BSPuzzle, marks: (boolean | null)[]): boolean {
  const { size, rowClues, colClues, solution } = puzzle;
  // All cells must match solution
  for (let i = 0; i < size * size; i++) {
    if (marks[i] !== solution[i]) return false;
  }
  // Row/col clues satisfied (redundant if marks=solution, but check anyway)
  const rowCounts = computeRowCounts(size, marks);
  const colCounts = computeColCounts(size, marks);
  for (let i = 0; i < size; i++) {
    if (rowCounts[i] !== rowClues[i]) return false;
    if (colCounts[i] !== colClues[i]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: BSSettings): BSState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  const marks: (boolean | null)[] = puzzle.revealed.slice();
  return { settings, puzzle, marks, won: false, moves: 0 };
}

export function reducer(state: BSState, action: BSAction): BSState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "mark": {
      const { idx, value } = action;
      // Can't change pre-revealed cells
      if (state.puzzle.revealed[idx] !== null) return state;
      const newMarks = state.marks.slice();
      newMarks[idx] = value;
      const won = checkWon(state.puzzle, newMarks);
      return { ...state, marks: newMarks, won, moves: state.moves + 1 };
    }
    case "reset": {
      return { ...state, marks: state.puzzle.revealed.slice(), won: false, moves: 0 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: BSState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
