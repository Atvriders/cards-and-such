import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColumnsState, ColumnsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Columns = /* @__PURE__ */ lazy(() => import("./Columns.js").then((mod) => ({ default: mod.Columns as unknown as React.ComponentType<unknown> })));
export const columnsSettings = {
  startLevel: {
    kind: "enum" as const,
    label: "Start level",
    options: ["1", "3", "5"] as const,
    default: "1" as const,
  },
} as const;

type ColumnsSettingsType = SettingsOf<typeof columnsSettings>;

export const columnsPlugin: GamePlugin<ColumnsState, ColumnsAction, typeof columnsSettings> = {
  id: "columns",
  title: "Columns",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stack falling trios of gems. Match 3+ in any direction to clear them. Survive as long as possible.",
  howToPlay: `Trios of three colored gems fall one column at a time. Move the trio left or right before it lands. Press Up or W to rotate the gems within the trio — this cycles the top gem to the middle, the middle to the bottom, and the bottom to the top. Use Down or S to soft-drop one row at a time, or Space to instantly drop the trio to the lowest available position.

When a trio lands, check for matches of three or more same-color gems in any direction: horizontal, vertical, or diagonal. All matching gems disappear, the remaining gems fall under gravity, and new matches can cascade automatically. Each cleared gem scores points, and cascades multiply the score.

The speed increases with each level. Every 10 gem-groups cleared advances the level. The game ends when a new trio cannot spawn at the top of the grid.

A preview panel on the right shows the next trio coming. Plan ahead — rotating before landing is key to setting up big chain reactions. Diagonal matches are powerful but easy to miss. Aim to keep the column heights balanced so you have room for long combos.

Start Level setting lets you jump straight to faster speeds for extra challenge.`,
  settings: columnsSettings,
  initialState: (seed: number, settings: ColumnsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".columns-board")) ? { selector: ".columns-board", pulses: 3 } : null,
  component: Columns,
};
