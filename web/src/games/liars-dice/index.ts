import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LiarsDiceState, LiarsDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LiarsDice } from "./LiarsDice.js";

export const liarsDiceSettings = {
  startingDice: {
    kind: "enum" as const,
    label: "Starting dice",
    options: ["3", "4", "5"] as const,
    default: "5" as const,
  },
  botAggressiveness: {
    kind: "enum" as const,
    label: "Bot",
    options: ["cautious", "balanced", "aggressive"] as const,
    default: "balanced" as const,
  },
} as const;

type LiarsDiceSettingsType = SettingsOf<typeof liarsDiceSettings>;

export const liarsDicePlugin: GamePlugin<LiarsDiceState, LiarsDiceAction, typeof liarsDiceSettings> = {
  id: "liars-dice",
  title: "Liar's Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid on how many dice show a given face across all players. Call the bluff when you don't believe it.",
  settings: liarsDiceSettings,
  initialState: (seed: number, settings: LiarsDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LiarsDice,
};
