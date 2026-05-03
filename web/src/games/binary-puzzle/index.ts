import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BinaryPuzzleState, BinaryPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BinaryPuzzleGame } from "./Game.js";

const binaryPuzzleSettings = {
  size: {
    kind: "number" as const,
    label: "Grid size",
    min: 6,
    max: 8,
    step: 2,
    default: 6,
  },
} as const;

type S = SettingsOf<typeof binaryPuzzleSettings>;

export const binaryPuzzlePlugin: GamePlugin<BinaryPuzzleState, BinaryPuzzleAction, typeof binaryPuzzleSettings> = {
  id: "binary-puzzle",
  title: "Binary Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the grid with 0s and 1s following three strict rules.",
  howToPlay: `Binary Puzzle (also known as Takuzu or Binairo) is a logic puzzle where you fill a grid with the digits 0 and 1. Some cells are pre-filled as clues; you must complete the rest.

Three rules govern every valid solution: First, no three identical digits may appear consecutively in any row or column — so "000" or "111" anywhere is forbidden. Second, each row and each column must contain exactly equal numbers of 0s and 1s (half and half). Third, no two rows may be identical, and no two columns may be identical.

Click an empty cell once to place a 0, again to place a 1, and a third time to clear it back to empty. Cells with a darker border are clues and cannot be changed.

These three simple rules are enough to deduce every cell through pure logic — no guessing is required if you apply them systematically. A 6×6 puzzle has 3 zeros and 3 ones per row/column; an 8×8 puzzle has 4 of each.

Score starts at 1000 and decreases by 5 per move, floor 100.

Tip: Look for any row or column with two consecutive identical digits — the cell on either side of the pair must be the opposite digit. Also, if a row already has its full quota of one digit, all remaining empty cells in that row must be the other digit.`,
  settings: binaryPuzzleSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".binary-puzzle-grid")) ? { selector: ".binary-puzzle-grid", pulses: 3 } : null,
  component: BinaryPuzzleGame,
};
