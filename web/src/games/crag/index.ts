import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CragState, CragAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Crag } from "./Crag.js";

export const cragSettings = {} as const;

type CragSettingsType = SettingsOf<typeof cragSettings>;

export const cragPlugin: GamePlugin<CragState, CragAction, typeof cragSettings> = {
  id: "crag",
  title: "Crag",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 3 dice up to 3 times and score in 14 categories — aim for the elusive Crag!",
  howToPlay: `Crag is a classic 3-dice scoring game similar to Yahtzee but with only three dice and fourteen unique categories to fill.

Each turn you may roll all three dice up to three times. After your first roll you can click any die to keep it and reroll the others. After all rolls, or when satisfied, click a category row to record your score.

The 14 categories are: Twos through Sixes (sum of matching dice), Odd Straight (1-3-5 = 20), Even Straight (2-4-6 = 20), Low Straight (1-2-3 = 20), High Straight (4-5-6 = 20), Three of a Kind (25), Crag (sum of 13 with a pair = 50 — the best score), Thirteen with all different (26), Any Thirteen (26), and Chance (sum of all dice).

Once a category is scored it cannot be reused. If your dice don't suit any unscored category, you must sacrifice one for zero points. The game ends after all 14 categories are filled. Maximize your total score by planning which categories to save for strong rolls.

A perfect game scoring every category optimally can reach around 300+ points. The Crag (50 points) is the prize combo — a pair that totals 13.`,
  settings: cragSettings,
  initialState: (seed: number, settings: CragSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Crag,
};
