import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PalindromeSudokuState, PalindromeSudokuAction, PalindromeSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PalindromeSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const palindromeSudokuPlugin: GamePlugin<PalindromeSudokuState, PalindromeSudokuAction, typeof settings> = {
  id: "palindrome-sudoku",
  title: "Palindrome Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marked palindrome lines must read the same forwards and backwards along their cells.",
  howToPlay: "Palindrome Sudoku marks special lines that must read identically forward and backward. The first cell on the line equals the last; the second equals the second-to-last; and so on. Cells in the middle pair with themselves automatically.\n\nStandard Sudoku rules still apply: each row, column, and box contains 1-9 once. The palindrome rule means the line can never have repeated values within a row, column, or box that conflict with Sudoku — so palindromes wandering through a single row are sharply constrained.\n\nEach puzzle shows a small grid with a palindrome line indicated, a target cell, and four candidate digits. Use the symmetry rule together with row/column/box uniqueness to find the unique legal value.\n\nSix puzzles per round, 100 points per correct answer plus a time bonus. Wrong picks reveal the correct digit so you can learn the pattern. Palindromes bring a poetic touch to logic puzzles — every clue mirrors its partner across the line's center.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as PalindromeSudokuSettings),
  reducer,
  isTerminal,
  component: PalindromeSudokuGame,
};
