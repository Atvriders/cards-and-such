import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YahtzeeState, YahtzeeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Yahtzee } from "./Yahtzee.js";

export const yahtzeeSettings = {
  strictYahtzeeBonus: {
    kind: "boolean" as const,
    label: "Strict Yahtzee Bonus",
    default: true,
  },
} as const;

type YahtzeeSettingsType = SettingsOf<typeof yahtzeeSettings>;

export const yahtzeePlugin: GamePlugin<YahtzeeState, YahtzeeAction, typeof yahtzeeSettings> = {
  id: "yahtzee",
  title: "Yahtzee-style",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13 rounds of 5-dice scoring across categories.",
  settings: yahtzeeSettings,
  initialState: (seed: number, settings: YahtzeeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Yahtzee,
};
