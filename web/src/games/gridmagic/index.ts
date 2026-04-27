import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GridmagicState, GridmagicAction, GridmagicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GridmagicGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gridmagicPlugin: GamePlugin<GridmagicState, GridmagicAction, typeof settings> = {
  id: "gridmagic", title: "Grid Magic", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill the blanks of a 3x3 magic square. 6 puzzles.",
  howToPlay: `Grid Magic is a tiny puzzle around the classic 3x3 magic square — the Lo-Shu square. In a 3x3 magic square, every row, every column, and both diagonals sum to the same number: 15. The numbers 1 through 9 each appear exactly once.

Each puzzle shows you a complete magic square (rotated or reflected from the canonical Lo-Shu) with two cells blanked out. A small "bank" of four numbers is offered — two of which are the correct values for the blanks, plus two distractors. Tap a blank cell to select it, tap a value from the bank to fill it in, then repeat for the second blank. Hit Submit when both blanks are filled.

Each correct puzzle scores 30 points; wrong attempts score 0. Use the magic property to deduce values: if a row already has, say, 4 and 9, the missing third entry is 15 − 4 − 9 = 2. Diagonals through the center 5 always pair up to 10.

There are 6 puzzles. Maximum score is 180 points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GridmagicSettings),
  reducer, isTerminal, component: GridmagicGame,
};
