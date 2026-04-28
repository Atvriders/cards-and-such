import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NonConsecutiveSudokuState, NonConsecutiveSudokuAction, NonConsecutiveSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NonConsecutiveSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const nonConsecutiveSudokuPlugin: GamePlugin<NonConsecutiveSudokuState, NonConsecutiveSudokuAction, typeof settings> = {
  id: "non-consecutive-sudoku",
  title: "Non-Consecutive Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard Sudoku with the added rule: no two orthogonally adjacent cells may contain consecutive digits.",
  howToPlay: "Non-Consecutive Sudoku adds a tasteful constraint to a 4x4 grid: no two cells sharing an edge may differ by exactly 1. So a cell containing a 2 can never have a 1 or a 3 directly above, below, left, or right of it.\n\nCombined with normal row and column rules, this constraint dramatically shrinks candidate sets. A 2 next to a 4 is fine, but a 2 next to a 3 is illegal. The rule especially restricts central cells, which have four orthogonal neighbors.\n\nEach puzzle shows a partial grid, marks a target cell, and offers four digits. Apply the row, column, and non-consecutive rules to pick the unique legal value.\n\nSix puzzles per round, scored 100 points per correct answer plus a speed bonus. Wrong picks earn nothing but reveal the correct value for learning. Non-Consecutive is approachable yet surprisingly subtle — many cells solve themselves once you list the forbidden neighbors.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as NonConsecutiveSudokuSettings),
  reducer,
  isTerminal,
  component: NonConsecutiveSudokuGame,
};
