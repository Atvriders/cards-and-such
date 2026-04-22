import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KismetState, KismetAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Kismet } from "./Kismet.js";

export const kismetSettings = {
  flushBonus: {
    kind: "boolean" as const,
    label: "Upper Section Bonus (63+)",
    default: true,
  },
} as const;

type KismetSettingsType = SettingsOf<typeof kismetSettings>;

export const kismetPlugin: GamePlugin<KismetState, KismetAction, typeof kismetSettings> = {
  id: "kismet",
  title: "Kismet",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Color-scoring Yahtzee variant. Flush, Full House, Four of a Kind, and Kismet (5-of-a-kind) all score sum of dice plus a bonus. Watch for all-same-color Flush hands!",
  howToPlay: `Kismet is a colorful Yahtzee variant played over 12 rounds. Roll 5 dice up to 3 times per round, then assign your result to one of 12 scoring categories.

The twist: each die face has a color. Even numbers (2, 4, 6) are red; odd numbers (1, 3, 5) are black. Several scoring categories reward same-color rolls.

Click "Roll Dice" to roll all five dice. Click a die to lock it between rolls. After at least one roll, click an empty category to score it.

Upper section (Ones–Sixes): score the sum of matching face values. Reach 63+ across these six to earn a 35-point bonus. Lower section categories: Two Pair (two different pairs) scores 25. Three of a Kind scores the sum of all dice. Flush (all dice the same color) scores 35. Full House (three + two of different faces) scores sum of all dice plus 15. Four of a Kind scores sum plus 25. Kismet (all five dice the same face) scores sum plus 50.

You must fill every category once. Assign a zero when you cannot meet the criteria — save your best categories for rolls that match. Flush is a good "backup" for any all-even or all-odd roll.

Tip: track the upper section bonus carefully. Scoring even partial matches in Ones–Sixes early helps you plan whether the bonus is in reach.`,
  settings: kismetSettings,
  initialState: (seed: number, settings: KismetSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Kismet,
};
