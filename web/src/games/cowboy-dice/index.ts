import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CowboyDiceState, CowboyDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CowboyDice } from "./CowboyDice.js";

export const cowboyDiceSettings = {
  bonusThreshold: {
    kind: "enum" as const,
    label: "Upper Bonus Threshold",
    options: ["63", "70"] as const,
    default: "63",
  },
} as const;

type CowboyDiceSettingsType = SettingsOf<typeof cowboyDiceSettings>;

export const cowboyDicePlugin: GamePlugin<CowboyDiceState, CowboyDiceAction, typeof cowboyDiceSettings> = {
  id: "cowboy-dice",
  title: "Cowboy Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A Wild West scorecard game — roll 5 dice 12 times and fill Western-themed categories for high score!",
  howToPlay: `Cowboy Dice is a Wild West scorecard game played over exactly 12 rounds — one for each category. Each round you roll five dice, keep any you like, and re-roll the rest up to two more times before scoring.

There are two sections. The upper section (Bullets through Sheriff Stars) scores the sum of matching faces: Bullets = total of 1s, Horseshoes = total of 2s, etc. Score 63 or more in the upper section (or 70 in hard mode) to earn a 35-point bonus — aim for three of each face value.

The lower section has six special categories: Posse (three of a kind — scores sum of all five dice), Outlaw (four of a kind — scores sum), Showdown (full house — 25 points), Rodeo (five of a kind — 80 points), Roundup (straight of five — 50 points), and Frontier (chance — scores sum regardless of pattern).

Each category can only be scored once. If your dice don't match well, you can always sacrifice a category for zero. Strategy matters: save Frontier as a flexible safety valve, and target Rodeo or Roundup early while you still have rolls to burn!`,
  settings: cowboyDiceSettings,
  initialState: (seed: number, settings: CowboyDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CowboyDice,
};
