import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxDeluxeState, QwixxDeluxeAction, QwixxDeluxeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxDeluxeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const qwixxDeluxePlugin: GamePlugin<QwixxDeluxeState, QwixxDeluxeAction, typeof settings> = {
  id: "qwixx-deluxe",
  title: "Qwixx Deluxe",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mark cells across 4 row colors as dice are rolled in increasing/decreasing order.",
  howToPlay: `Qwixx Deluxe is a row-locking dice game with bonus dice. In this adaptation you have 4 colored rows (red, yellow, green, blue), each with 11 cells (numbers 2-12 in red and yellow ascending; 12-2 in green and blue descending).

Each turn you roll 2 dice. The sum becomes the eligible mark for the LOWEST currently-unmarked cell of any matching row.

Click the colored row button to apply your roll to that row. If the matching cell exists, it gets marked and you score 2 points. If it doesn't (already marked or sum impossible), the click costs nothing — pass.

Scoring:
• 2 points per cell marked.
• +5 bonus per fully-completed row (all 11 cells).
• Penalty −5 if you waste 3+ rolls (decline-only turns).

The game runs 12 rolls. Aim to keep all 4 rows growing together. A strong run scores 30-45 points. Each row scaling by 11 cells caps the maximum, but bonus rewards completion.

This is a simplified Qwixx; the original has cell-by-cell ascending order rules; the bones are preserved.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QwixxDeluxeSettings),
  reducer,
  isTerminal,
  component: QwixxDeluxeGame,
};
