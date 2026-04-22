import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Drop7State, Drop7Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Drop7 } from "./Drop7.js";

export const drop7Settings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["normal", "fast"] as const,
    default: "normal" as const,
  },
} as const;

type Drop7SettingsType = SettingsOf<typeof drop7Settings>;

export const drop7Plugin: GamePlugin<Drop7State, Drop7Action, typeof drop7Settings> = {
  id: "drop7-like",
  title: "Disc Drop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop numbered discs into a 7×7 grid. A disc clears when its number matches the disc count in its row or column.",
  howToPlay: `The grid is 7 columns wide and 7 rows tall. Numbered discs (1 through 7) drop from above when you click a column. After a disc lands, check the clear rule: a disc disappears if the count of discs in its row equals its number, OR the count of discs in its column equals its number.

For example, a disc showing "3" clears when there are exactly 3 discs in its row or 3 discs in its column. Multiple discs can clear in a single drop if several meet the rule at once. After clears, remaining discs fall under gravity, which can trigger further chain clears.

Every N discs dropped (decreasing as levels increase), a new row of grey blank discs rises from the bottom, pushing everything up. Blank discs do not have numbers — they just take up space and count toward row/column totals. Blanks are removed by proximity to clears.

The game ends when any disc is pushed past the top edge. Score is the sum of all disc values cleared. Plan each drop to set up combos: placing a disc so it simultaneously satisfies row and column conditions creates a chain reaction.

Speed setting controls how quickly new blank rows are introduced. Normal gives you more time to build; Fast introduces rows more aggressively.`,
  settings: drop7Settings,
  initialState: (seed: number, settings: Drop7SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Drop7,
};
