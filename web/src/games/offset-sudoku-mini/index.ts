import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { OffsetSudokuMiniState, OffsetSudokuMiniStateAction, OffsetSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OffsetSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const offsetSudokuMiniPlugin: GamePlugin<OffsetSudokuMiniState, OffsetSudokuMiniStateAction, typeof settings> = {
  id: "offset-sudoku-mini",
  title: "Offset Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sudoku boxes are shifted from standard positions. Pick missing digit.",
  howToPlay: "Offset Sudoku looks like a standard Sudoku at first glance, but the box boundaries are shifted from the conventional 3x3 alignment. The boxes might be staggered diagonally or offset by one cell row-by-row, giving each box an irregular but identical-area shape.\n\nThis Mini version uses a 4x4 grid with 2x2-area boxes that are offset by one cell, so the boxes form irregular zigzag shapes. The constraint is identical to standard Sudoku: each row, column, and box uses each of 1 to 4 exactly once.\n\nSix puzzles per round; 100 points per correct answer. The trick is visualizing the shifted box boundaries — a digit placed in one cell may rule out values in surprising spots because the shifted box reaches further than it appears. Once you see the staggered layout, the puzzle plays like Sudoku with extra spice. Choose the right digit.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as OffsetSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: OffsetSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-offset-sudoku-mini-answer-0"]', pulses: 3 } : null,component: OffsetSudokuMiniGame,
};
