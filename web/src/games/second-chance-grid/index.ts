import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SecondChanceGridState, SecondChanceGridAction, SecondChanceGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SecondChanceGridGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const secondChanceGridPlugin: GamePlugin<SecondChanceGridState, SecondChanceGridAction, typeof settings> = {
  id: "second-chance-grid",
  title: "Second Chance Grid",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Polyomino flip placement on a 5x5 grid; fewest leftover cells wins.",
  howToPlay: `Second Chance is a polyomino flip-and-write. In this adaptation you flip 12 polyomino cards (each is a 1-4 cell shape) and try to fill a 5x5 grid (25 cells) without overlapping.

Each turn click any empty cell. The polyomino's anchor lands there; cells extending in pre-defined directions fill if empty (else the placement is partial).

Scoring (at end):
• Each filled cell: +1 base point (max 25)
• Bonus +20 if you fill all 25 cells (perfect — extremely rare)
• Bonus +10 if 22-24 cells are filled
• Bonus +5 if 18-21 cells are filled
• Penalty −1 per polyomino that placed 0 cells (entirely off-grid)

The game runs 12 rolls. With polyomino sizes averaging ~2.5 cells, you'll fill roughly 18-22 cells, putting you in the second tier of bonus.

Strategy: anchor polyominoes such that their extensions stay in-grid. Reserve corner space for 1-cell polyominoes. A strong Second Chance run scores 25-40 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SecondChanceGridSettings),
  reducer,
  isTerminal,
  component: SecondChanceGridGame,
};
