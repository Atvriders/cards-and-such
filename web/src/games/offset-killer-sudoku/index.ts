import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OffsetKillerSudokuState, OffsetKillerSudokuStateAction, OffsetKillerSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OffsetKillerSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const offsetKillerSudokuPlugin: GamePlugin<OffsetKillerSudokuState, OffsetKillerSudokuStateAction, typeof settings> = {
  id: "offset-killer-sudoku",
  title: "Offset Killer Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Killer cages with shifted box alignment.",
  howToPlay: "Offset Killer Sudoku combines two variants. The grid uses Killer Sudoku rules (cages with sum totals; no repeats within a cage) and Offset Sudoku rules (boxes shifted from standard positions). The result is a fierce hybrid: cages pin some sums, while shifted boxes break standard intuitions.\n\nIn the offset arrangement, the boxes don't line up on the 3x3 boundaries — they're staggered diagonally or rotated, so a digit placed in a cell may rule out values across an unexpected zigzag region.\n\nThis quiz uses 9x9 Offset Killer Sudoku with six puzzles. Each highlights a cell inside both a cage and a shifted box, presenting four candidates. Apply the cage sum, the cage no-repeat, the shifted box no-repeat, and the row/column rules. Six puzzles per round; 100 points per correct answer plus time bonus. Pick the digit satisfying every constraint at once. Offset Killer puzzles reward holding multiple constraint chains in mind simultaneously.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as OffsetKillerSudokuSettings),
  reducer,
  isTerminal,
  component: OffsetKillerSudokuGame,
};
