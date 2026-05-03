import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SandwichSudokuState, SandwichSudokuAction, SandwichSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SandwichSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sandwichSudokuPlugin: GamePlugin<SandwichSudokuState, SandwichSudokuAction, typeof settings> = {
  id: "sandwich-sudoku",
  title: "Sandwich Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Each row and column has a clue equal to the sum of digits between the 1 and the 9 in that line.",
  howToPlay: "Sandwich Sudoku adds row and column \"sandwich clues\": for each line, the clue gives the total sum of the digits sitting strictly between the 1 and the 9 (in either order). A clue of 0 means the 1 and 9 are adjacent. A clue of 35 means every other digit is between them — they sit at opposite ends.\n\nStandard Sudoku rules apply: each row, column, and box contains 1-9 once. The sandwich constraint pins down where the 1 and 9 can live in a line by counting cells: the number of digits between them is determined by the sum together with which subset of 2-8 fits the total.\n\nEach puzzle shows a small example with a sandwich clue, a target cell, and four candidate digits. Reason about possible 1/9 positions and the digits between them.\n\nSix puzzles per round; 100 points per correct answer plus a speed bonus. Wrong answers reveal the correct value. Sandwich is one of the most popular modern variants — clean, elegant, and suprisingly tricky.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SandwichSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: SandwichSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-sandwich-sudoku-answer-0"]', pulses: 3 } : null,component: SandwichSudokuGame,
};
