import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollAndAddState, RollAndAddAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RollAndAdd } from "./RollAndAdd.js";

export const rollAndAddSettings = {
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["21", "31", "51"] as const,
    default: "21" as const,
  },
} as const;

type RollAndAddSettingsType = SettingsOf<typeof rollAndAddSettings>;

export const rollAndAddPlugin: GamePlugin<RollAndAddState, RollAndAddAction, typeof rollAndAddSettings> = {
  id: "roll-and-add",
  title: "Roll and Add",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to build a total as close to the target as possible — without going over!",
  howToPlay: `Roll and Add is a dice game inspired by blackjack. Each round you have a target number — 21, 31, or 51 depending on your setting. Your goal is to roll dice and accumulate a total as close to that target as possible without exceeding it.

On each turn you choose how many dice to roll (one to four) using the plus and minus buttons, then click Roll. The dice results are added to your running total. You can keep rolling as many times as you like. When you are happy with your total, click Bank to lock in your score for that round.

Scoring rewards precision. Hitting the target exactly earns 200 points. Every point away from the target reduces your score by 4, down to a minimum of 0. Going over the target — busting — earns nothing for that round.

More dice means faster progress toward the target but also more risk: a high roll can send you flying over. One die gives fine control; four dice are exhilarating but dangerous.

You play five rounds. Each round starts fresh with a running total of zero. Your final game score is the sum of all five rounds. Maximum possible score is 1000 points — hit the target exactly every round!`,
  settings: rollAndAddSettings,
  initialState: (seed: number, settings: RollAndAddSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RollAndAdd,
};
