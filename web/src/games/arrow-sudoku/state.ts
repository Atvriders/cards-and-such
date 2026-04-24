import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { ArrowSudokuPuzzle } from "./puzzles.js";

export type { ArrowSudokuPuzzle };

export interface ArrowSudokuSettings {
  difficulty: "easy" | "hard";
}

export interface ArrowSudokuState {
  settings: ArrowSudokuSettings;
  puzzle: ArrowSudokuPuzzle;
  board: number[]; // 0=empty, 1-6=player entry
  selected: number | null;
  won: boolean;
  moves: number;
}

export type ArrowSudokuAction =
  | { type: "selectCell"; idx: number }
  | { type: "enterDigit"; digit: number }
  | { type: "clearCell" }
  | { type: "reset" };

export function checkWon(puzzle: ArrowSudokuPuzzle, board: number[]): boolean {
  const N = 6;
  // All cells filled
  if (board.some(v => v === 0)) return false;
  // Rows/cols uniqueness
  for (let i = 0; i < N; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    for (let j = 0; j < N; j++) {
      const rv = board[i * N + j] ?? 0;
      const cv = board[j * N + i] ?? 0;
      if (rv === 0 || cv === 0 || col.has(cv) || row.has(rv)) return false;
      row.add(rv);
      col.add(cv);
    }
  }
  // 2×3 boxes
  const boxRows = [0, 0, 1, 1, 2, 2] as const;
  const boxCols = [0, 1, 0, 1, 0, 1] as const;
  for (let b = 0; b < N; b++) {
    const br = (boxRows[b as 0|1|2|3|4|5] ?? 0) * 2;
    const bc = (boxCols[b as 0|1|2|3|4|5] ?? 0) * 3;
    const box = new Set<number>();
    for (let dr = 0; dr < 2; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        const v = board[(br + dr) * N + (bc + dc)] ?? 0;
        if (v === 0 || box.has(v)) return false;
        box.add(v);
      }
    }
  }
  // Arrow constraints
  for (const { head, shaft } of puzzle.arrows) {
    const headVal = board[head];
    if (headVal === 0) return false;
    const sum = shaft.reduce((s, idx) => s + (board[idx] ?? 0), 0);
    if (headVal !== sum) return false;
  }
  return true;
}

export function initialState(seed: number, settings: ArrowSudokuSettings): ArrowSudokuState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  const board = puzzle.givens.slice();
  return {
    settings,
    puzzle,
    board,
    selected: null,
    won: false,
    moves: 0,
  };
}

export function reducer(state: ArrowSudokuState, action: ArrowSudokuAction): ArrowSudokuState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectCell": {
      const { idx } = action;
      // Cannot select given cells
      if (state.puzzle.givens[idx] !== 0) return { ...state, selected: null };
      return { ...state, selected: idx };
    }
    case "enterDigit": {
      if (state.selected === null) return state;
      const { digit } = action;
      if (digit < 1 || digit > 6) return state;
      const board = state.board.slice();
      board[state.selected] = digit;
      const won = checkWon(state.puzzle, board);
      return { ...state, board, won, moves: state.moves + 1 };
    }
    case "clearCell": {
      if (state.selected === null) return state;
      if (state.puzzle.givens[state.selected] !== 0) return state;
      const board = state.board.slice();
      board[state.selected] = 0;
      return { ...state, board, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        board: state.puzzle.givens.slice(),
        selected: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: ArrowSudokuState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
