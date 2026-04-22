import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_HARD } from "./puzzles.js";
import type { CavePuzzle, CaveClue } from "./puzzles.js";

export type { CavePuzzle, CaveClue };

export interface CaveSettings {
  difficulty: "easy" | "hard";
}

export type CellMark = "empty" | "shaded" | "dot";

export interface CaveState {
  settings: CaveSettings;
  puzzle: CavePuzzle;
  board: CellMark[];
  won: boolean;
  moves: number;
}

export type CaveAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" };

export function checkWon(puzzle: CavePuzzle, board: CellMark[]): boolean {
  for (let i = 0; i < board.length; i++) {
    const shouldBeShaded = puzzle.solution[i]!;
    if (shouldBeShaded && board[i] !== "shaded") return false;
    if (!shouldBeShaded && board[i] === "shaded") return false;
  }
  return true;
}

/** Compute visibility count for a cell (used in display) */
export function computeVisibility(puzzle: CavePuzzle, board: CellMark[], r: number, c: number): number {
  const { size } = puzzle;
  if (board[r * size + c] === "shaded") return 0;
  let count = 1; // self
  // up
  for (let dr = r - 1; dr >= 0; dr--) {
    if (board[dr * size + c] === "shaded") break;
    count++;
  }
  // down
  for (let dr = r + 1; dr < size; dr++) {
    if (board[dr * size + c] === "shaded") break;
    count++;
  }
  // left
  for (let dc = c - 1; dc >= 0; dc--) {
    if (board[r * size + dc] === "shaded") break;
    count++;
  }
  // right
  for (let dc = c + 1; dc < size; dc++) {
    if (board[r * size + dc] === "shaded") break;
    count++;
  }
  return count;
}

export function initialState(seed: number, settings: CaveSettings): CaveState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_HARD;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    board: new Array(puzzle.size * puzzle.size).fill("empty") as CellMark[],
    won: false,
    moves: 0,
  };
}

export function reducer(state: CaveState, action: CaveAction): CaveState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "clickCell": {
      const newBoard = state.board.slice() as CellMark[];
      const cur = newBoard[action.idx]!;
      newBoard[action.idx] = cur === "empty" ? "shaded" : cur === "shaded" ? "dot" : "empty";
      const won = checkWon(state.puzzle, newBoard);
      return { ...state, board: newBoard, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        board: new Array(state.puzzle.size * state.puzzle.size).fill("empty") as CellMark[],
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: CaveState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 4) };
}
