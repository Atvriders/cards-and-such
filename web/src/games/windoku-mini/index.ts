import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WindokuMiniState, WindokuMiniAction, WindokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WindokuMiniGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const windokuMiniPlugin: GamePlugin<WindokuMiniState, WindokuMiniAction, typeof settings> = {
  id: "windoku-mini",
  title: "Windoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `4×4 Windoku: extra shaded windows add constraints — find the unique digit.`,
  howToPlay: `Windoku is a Sudoku variant featuring four extra shaded "window" regions inside the main grid; each window must also contain the digits 1-N exactly once. Standard row, column, and box constraints still apply.

In this 4×4 solo adaptation each puzzle shows a partially-filled 4×4 with one extra 2×2 window region (overlapping the standard boxes) and asks which digit fills a marked cell. Pick from 1, 2, 3, 4.

Eight puzzles per session, 100 points each (800 max).

Tips: extra constraints give Windoku more information than classic Sudoku, so unique cells appear earlier. Always check the four window regions in addition to row, column, and box. Window constraints are most powerful at the intersections of multiple windows. Look for cells where the row, column, AND window force the same eliminations.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WindokuMiniSettings),
  reducer,
  isTerminal,
  component: WindokuMiniGame,
};
