import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SudokuMini4x4State, SudokuMini4x4Action, SudokuMini4x4Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SudokuMini4x4Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sudokuMini4x4Plugin: GamePlugin<SudokuMini4x4State, SudokuMini4x4Action, typeof settings> = {
  id: "sudoku-mini-4x4",
  title: "Sudoku Mini 4x4",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Children's Sudoku on a 4x4 grid using digits 1-4. Each row, column, and 2x2 box has each digit exactly once.",
  howToPlay: "Sudoku Mini 4x4 is the gentlest introduction to Sudoku. The grid is 4x4, divided into four 2x2 boxes, and the digits used are simply 1, 2, 3, and 4. Each row, each column, and each 2x2 box must contain every digit exactly once.\n\nThe puzzle is solvable by quick scan-and-place — no advanced techniques needed. It's perfect for new players, kids, or anyone wanting a brain teaser they can finish in under a minute.\n\nEach puzzle shows a partial grid with a few givens. A target cell is highlighted with four candidate digits (1, 2, 3, 4). Pick the digit that satisfies row, column, and box uniqueness.\n\nSix puzzles per round. Correct answers earn 100 points plus a 10-point-per-second time bonus. Wrong picks earn nothing but reveal the correct digit. After answering, press Next to move on. Mini Sudoku is a great daily warm-up before tackling full 9x9 puzzles.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SudokuMini4x4Settings),
  reducer,
  isTerminal,
  component: SudokuMini4x4Game,
};
