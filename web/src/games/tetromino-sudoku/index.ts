import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TetrominoSudokuState, TetrominoSudokuStateAction, TetrominoSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TetrominoSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const tetrominoSudokuPlugin: GamePlugin<TetrominoSudokuState, TetrominoSudokuStateAction, typeof settings> = {
  id: "tetromino-sudoku",
  title: "Tetromino Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tetromino shapes overlay grid; extra constraint each tetromino has unique digits.",
  howToPlay: "Tetromino Sudoku overlays Tetris-piece shapes on a standard Sudoku grid. Each marked tetromino region (an L, T, S, Z, I, O, or J shape covering four cells) must contain four distinct digits — none repeating within the tetromino. This is in addition to the standard row, column, and 3x3 box rules.\n\nThe tetrominoes typically don't tile the full grid; only a few are highlighted as constraints. Where they overlap with rows or columns, deductions cascade powerfully.\n\nThis quiz uses 9x9 Tetromino Sudoku with six puzzles. Each highlights a cell sitting inside a tetromino and asks for its value, providing four candidates. Apply standard Sudoku constraints plus the tetromino's no-repeat rule. Six puzzles per round; 100 points per correct answer plus time bonus. The tetrominoes often pin a cell when row and column alone leave two candidates — the tetromino constraint excludes one, leaving the answer. Pick the digit honoring all constraints.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as TetrominoSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: TetrominoSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tetromino-sudoku-answer-0"]', pulses: 3 } : null,component: TetrominoSudokuGame,
};
