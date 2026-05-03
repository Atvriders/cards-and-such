import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArrowSudokuState, ArrowSudokuAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArrowSudoku } from "./ArrowSudoku.js";

import { ArrowSudokuGame } from "./Game.js";
const arrowSudokuSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof arrowSudokuSettings>;

export const arrowSudokuPlugin: GamePlugin<ArrowSudokuState, ArrowSudokuAction, typeof arrowSudokuSettings> = {
  id: "arrow-sudoku",
  title: "Arrow Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 1-6 in a 6×6 grid; each circled head digit must equal the sum of digits along its arrow.",
  howToPlay: `Arrow Sudoku combines classic Sudoku with arithmetic arrow clues on a 6×6 grid.

Standard rules first: place the digits 1 through 6 in every row, every column, and every 2×3 box so that no digit repeats within any of those groups.

Arrow clues add a second constraint. Some cells are marked with a circle (the arrow head) and have one or more cells trailing away like an arrow shaft. The digit you place in the circle cell must equal the sum of all the digits placed along the shaft cells. Arrow cells are not exempt from normal Sudoku rules — every digit still obeys row, column, and box uniqueness.

To play: click an empty cell to select it (highlighted blue), then tap a digit button 1–6 to enter it. Tap X to erase. Red digits flag row or column conflicts. Yellow cells mark arrow heads; light-grey cells mark shaft squares.

Strategy tip: arrow heads with short shafts (one or two cells) give the tightest constraints — start there. Cross-check shaft sums against available digits in the row and column to narrow possibilities quickly.

Click Reset to start fresh.`,
  settings: arrowSudokuSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".arrowsudoku-num", pulses: 3 }; },
  component: ArrowSudokuGame,
};
