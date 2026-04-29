import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WindokuPlusMiniState, WindokuPlusMiniStateAction, WindokuPlusMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WindokuPlusMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const windokuPlusMiniPlugin: GamePlugin<WindokuPlusMiniState, WindokuPlusMiniStateAction, typeof settings> = {
  id: "windoku-plus-mini",
  title: "Windoku Mini Plus",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Window Sudoku alt — extra regions added to standard grid.",
  howToPlay: "Windoku (also called Hyper Sudoku or Window Sudoku) places extra constraint regions over a standard Sudoku grid. The classic version has four additional 3x3 regions (the windows) overlapping the standard 3x3 boxes. Each window must also contain each digit 1 to 9 exactly once.\n\nThis Mini Plus version uses a 4x4 grid with two extra 2x2 windows positioned in the off-center cells. The extra regions add deduction power: when standard rules don't pin a cell, the windows often do.\n\nSix puzzles per round; 100 points per correct answer with a time bonus. Each puzzle highlights one cell sitting inside a window and asks for its value, providing four candidates. The trick is remembering to scan the window region in addition to the row, column, and box. Once you internalize the extra regions, Windoku puzzles become a satisfying logic exercise. Pick the digit that satisfies row, column, box, and window.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as WindokuPlusMiniSettings),
  reducer,
  isTerminal,
  component: WindokuPlusMiniGame,
};
