import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WYRState, WYRAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WouldYouRather } from "./Game.js";

export const wouldYouRatherSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "25", "50"] as const,
    default: "10" as const,
  },
} as const;

type WYRSettingsType = SettingsOf<typeof wouldYouRatherSettings>;

export const wouldYouRatherPlugin: GamePlugin<WYRState, WYRAction, typeof wouldYouRatherSettings> = {
  id: "would-you-rather",
  title: "Would You Rather",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick between two wild dilemmas and see if you agree with the majority!",
  howToPlay: `Would You Rather presents you with a pair of outrageous, funny, or thought-provoking dilemmas. For each round you must pick one of the two options — there is no skipping and no neutral option.

After you make your choice, the game reveals how a simulated pool of other players voted. You see a bar showing the split between Option A and Option B, along with percentages for each side.

The game tracks how often your choices align with the majority. Your final score is the number of rounds where you agreed with the majority — so you are essentially trying to predict crowd preferences while also answering honestly.

There is no right or wrong answer. The fun is in seeing whether your instincts match the crowd's, and in discussing the dilemmas with friends. Use it as a party icebreaker by reading questions out loud and debating before revealing the simulated majority.

Choose 10, 25, or 50 rounds in settings. Questions are drawn from a large pool and shuffled each game, so no two playthroughs are identical. Enjoy the absurdity and see how mainstream (or contrarian) your preferences really are!`,
  settings: wouldYouRatherSettings,
  initialState: (seed: number, settings: WYRSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: WouldYouRather,
};
