import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollingAmericaState, RollingAmericaAction, RollingAmericaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollingAmericaGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rollingAmericaPlugin: GamePlugin<RollingAmericaState, RollingAmericaAction, typeof settings> = {
  id: "rolling-america",
  title: "Rolling America",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Color US states from dice rolls; max two colors per region.",
  howToPlay: `Rolling America is a US-map coloring roll-and-write. In this adaptation, the 5x5 grid is divided into 4 colored regions (top-left, top-right, bottom-left, bottom-right 3x3 areas overlap). Each turn you roll 2 dice: a 6-face number die (1-6) and a 4-face color die (R, Y, G, B).

Click any empty cell to mark it with the rolled color, scoring +2 if the value-die-face matches the cell's hidden number (which is its (row*5 + col + 1) position mod 6, plus 1).

This gets complex — for simplicity in our version:

Scoring (at end):
• Each cell marked: +1 base
• Each cell whose row contains exactly 2 colors (no more, no less): +3 per row
• Each cell whose column contains exactly 2 colors: +3 per column
• Bonus +10 if you mark 12+ cells
• Penalty −1 per cell that is the same color as 3+ of its neighbors

The game runs 14 rolls. Aim for variety per row and column. A strong run scores 25-40. The 'two colors per region' is the heart of the original; here it becomes per-row/per-column.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RollingAmericaSettings),
  reducer,
  isTerminal,
  component: RollingAmericaGame,
};
