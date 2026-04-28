import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HyperSudokuMiniState, HyperSudokuMiniAction, HyperSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HyperSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const hyperSudokuMiniPlugin: GamePlugin<HyperSudokuMiniState, HyperSudokuMiniAction, typeof settings> = {
  id: "hyper-sudoku-mini",
  title: "Hyper Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Like 4x4 Sudoku but with extra inner 2x2 region overlapping the standard boxes — also known as Windoku.",
  howToPlay: "Hyper Sudoku Mini (also called Windoku) places one extra 2x2 region floating over the inner cells of a 4x4 grid. Every row, column, the four standard boxes, and the extra hyper region must each contain digits 1-4 with no repeats.\n\nThe extra region constrains the central cells tightly — once you place a digit in one of those four cells, the same digit is locked out from the other three. This frequently chains into corner cells via row/column shared cells.\n\nYou'll see a partially filled grid with the hyper region indicated, a target cell, and four candidate digits. Use the combined constraints to deduce the unique answer.\n\nSix puzzles per round. Submit your choice; the correct answer is shown; press Next to continue. Score is 100 points per correct answer plus a 10-points-per-second time bonus. Hyper Sudoku is harder than it looks for such a small grid — every placement ripples in two directions at once.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as HyperSudokuMiniSettings),
  reducer,
  isTerminal,
  component: HyperSudokuMiniGame,
};
