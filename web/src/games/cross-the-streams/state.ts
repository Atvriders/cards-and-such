import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { CTSPuzzle } from "./puzzles.js";

export type { CTSPuzzle };

export interface CTSSettings {
  difficulty: "easy" | "medium";
}

// null = unmarked, true = filled, false = empty
export interface CTSState {
  settings: CTSSettings;
  puzzle: CTSPuzzle;
  marks: (boolean | null)[];
  won: boolean;
  moves: number;
}

export type CTSAction =
  | { type: "mark"; idx: number; value: boolean | null }
  | { type: "reset" };

export function computeRuns(cells: (boolean | null)[]): number[] {
  const runs: number[] = [];
  let count = 0;
  for (const b of cells) {
    if (b === true) count++;
    else if (count > 0) { runs.push(count); count = 0; }
  }
  if (count > 0) runs.push(count);
  return runs.length > 0 ? runs : [0];
}

export function rowsMatch(puzzle: CTSPuzzle, marks: (boolean | null)[]): boolean[] {
  return Array.from({ length: puzzle.rows }, (_, r) => {
    const row = Array.from({ length: puzzle.cols }, (__, c) => marks[r * puzzle.cols + c]!);
    const runs = computeRuns(row);
    const clue = puzzle.rowClues[r]!;
    return JSON.stringify(runs) === JSON.stringify(clue);
  });
}

export function colsMatch(puzzle: CTSPuzzle, marks: (boolean | null)[]): boolean[] {
  return Array.from({ length: puzzle.cols }, (_, c) => {
    const col = Array.from({ length: puzzle.rows }, (__, r) => marks[r * puzzle.cols + c]!);
    const runs = computeRuns(col);
    const clue = puzzle.colClues[c]!;
    return JSON.stringify(runs) === JSON.stringify(clue);
  });
}

export function checkWon(puzzle: CTSPuzzle, marks: (boolean | null)[]): boolean {
  const { rows, cols, solution } = puzzle;
  for (let i = 0; i < rows * cols; i++) {
    if (marks[i] !== solution[i]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: CTSSettings): CTSState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    marks: new Array(puzzle.rows * puzzle.cols).fill(null),
    won: false,
    moves: 0,
  };
}

export function reducer(state: CTSState, action: CTSAction): CTSState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "mark": {
      const { idx, value } = action;
      const newMarks = state.marks.slice();
      newMarks[idx] = value;
      const won = checkWon(state.puzzle, newMarks);
      return { ...state, marks: newMarks, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, marks: new Array(state.puzzle.rows * state.puzzle.cols).fill(null), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: CTSState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
