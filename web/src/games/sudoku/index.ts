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
  settings: sudokuSettings,
  initialState: (seed: number, settings: SudokuSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Sudoku,
};
