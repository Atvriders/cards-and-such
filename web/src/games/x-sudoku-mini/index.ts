import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { XSudokuMiniState, XSudokuMiniAction, XSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { XSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const xSudokuMiniPlugin: GamePlugin<XSudokuMiniState, XSudokuMiniAction, typeof settings> = {
  id: "x-sudoku-mini",
  title: "X-Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard 4x4 Sudoku with the added rule that both main diagonals must also contain each digit exactly once.",
  howToPlay: "X-Sudoku Mini stamps an X across the grid: both main diagonals must each contain digits 1-4 exactly once. Standard Sudoku rules still apply (rows, columns, boxes), so the diagonals act as two extra \"rows.\"\n\nIn a 4x4 grid each diagonal has just 4 cells, so the X-rule lock is tight: any digit placed on the main diagonal automatically excludes that digit from the other three diagonal cells.\n\nEach puzzle shows a partial grid with the X highlighted, a target cell, and four candidate digits. Use the diagonal rule together with row/column logic to find the unique legal value.\n\nSix puzzles per round, scored 100 points per correct answer plus a time bonus. Wrong answers display the correct digit so you can learn. X-Sudoku is one of the gentlest variant Sudokus — the extra diagonals are intuitive and almost immediately useful in any puzzle.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as XSudokuMiniSettings),
  reducer,
  isTerminal,
  component: XSudokuMiniGame,
};
