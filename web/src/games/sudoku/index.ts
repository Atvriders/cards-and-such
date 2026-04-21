import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SudokuState, SudokuAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Sudoku } from "./Sudoku.js";

export const sudokuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type SudokuSettingsType = SettingsOf<typeof sudokuSettings>;

export const sudokuPlugin: GamePlugin<SudokuState, SudokuAction, typeof sudokuSettings> = {
  id: "sudoku",
  title: "Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the 9×9 grid so every row, column, and 3×3 box contains digits 1–9.",
  howToPlay: `Fill every cell of the 9×9 grid so that digits 1–9 appear exactly once in each row, each column, and each of the nine 3×3 boxes. Grey "given" cells are pre-filled and cannot be changed.

Click any white (empty) cell to select it — it highlights blue. Then click a digit on the number pad or press a keyboard key (1–9) to enter that number, or press 0 / Delete / Backspace to clear it. Conflicting cells (duplicates in the same row, column, or box) are highlighted in red to help you spot errors. Use the "Hint" button to automatically fill one empty cell with the correct digit; each hint counts as an extra move penalty. Difficulty controls how many clues are removed: Easy leaves many givens, Medium fewer, Hard the fewest.

Scoring: score = max(100, 1000 − moves × 5 − hints × 50). Fewer moves and fewer hints produce a higher score; the floor is always 100.

Tips: start with rows, columns, or boxes that are nearly complete — they constrain the remaining digits most tightly. Each hint costs 50 points so try to reserve it for genuine impasses.`,
  settings: sudokuSettings,
  initialState: (seed: number, settings: SudokuSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Sudoku,
};
