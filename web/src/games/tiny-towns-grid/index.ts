import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TinyTownsGridState, TinyTownsGridAction, TinyTownsGridSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TinyTownsGridGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tinyTownsGridPlugin: GamePlugin<TinyTownsGridState, TinyTownsGridAction, typeof settings> = {
  id: "tiny-towns-grid",
  title: "Tiny Towns",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Resource-and-build village placement on a 4x4 grid.",
  howToPlay: `Tiny Towns is a tableau-building game where you place resources and convert them into buildings on a 4x4 personal grid. In this adaptation you draw 16 random items and place them in any empty cell of the 4x4 (16-cell) grid.

Items are one of five types: wood, brick, glass, stone, and wheat.

Click any empty cell to place the next item from the queue.

Scoring (at end):
• Each adjacent matching pair: +2 points (orthogonally adjacent items of the same type).
• Each cell that is fully surrounded (4 different types as orthogonal neighbors): +6 points.
• Each completed row of 4 (any items): +3 points.
• Each completed column of 4 (any items): +3 points.
• Bonus +5 if the entire 4x4 grid is filled.

With 16 items and 16 cells you'll fill every cell — automatic +5. Then optimize matching pairs (group same types) and at least one fully-surrounded cell.

A top score reaches 35-45. The center cells are easier to surround than corners, so save your variety for the middle.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TinyTownsGridSettings),
  reducer,
  isTerminal,
  component: TinyTownsGridGame,
};
