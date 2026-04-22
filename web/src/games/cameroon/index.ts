import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CameroonState, CameroonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Cameroon } from "./Cameroon.js";

export const cameroonSettings = {
  cameroonBonus: {
    kind: "boolean" as const,
    label: "Cameroon Bonus (+50 per 5-of-a-kind)",
    default: true,
  },
} as const;

type CameroonSettingsType = SettingsOf<typeof cameroonSettings>;

export const cameroonPlugin: GamePlugin<CameroonState, CameroonAction, typeof cameroonSettings> = {
  id: "cameroon",
  title: "Cameroon",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10-round Yacht-style dice game with 10 categories including Little Straight, Big Straight, Full House, Poker, and the elusive Cameroon (5 of a kind).",
  howToPlay: `Cameroon is a Yacht-style dice scoring game played over 10 rounds. Each round you roll 5 dice up to 3 times, then score the result in one of 10 categories. Each category may only be used once.

Click "Roll Dice" to roll all five dice. After the first roll you may click individual dice to keep (lock) them, then click "Re-roll" to reroll the rest — up to 3 rolls total. After at least one roll, click any empty row in the scorecard to assign your dice to that category.

Scoring categories: Ones through Sixes score the sum of that face value. Little Straight (1-2-3-4-5) scores 15. Big Straight (2-3-4-5-6) scores 20. Full House (three of a kind plus a pair) scores 30. Poker (four of a kind) scores 40. If you score any category while holding five of the same face, you earn a bonus 50 points — that's a Cameroon!

Strategy tip: Ones through Sixes will often score 0 if your dice don't cooperate — don't hesitate to dump a bad roll there rather than sacrifice a higher-value category. Always save at least one roll attempt when chasing the big bonuses.

Aim for the highest possible total across all 10 categories. A Cameroon on every roll would score 550 points.`,
  settings: cameroonSettings,
  initialState: (seed: number, settings: CameroonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Cameroon,
};
