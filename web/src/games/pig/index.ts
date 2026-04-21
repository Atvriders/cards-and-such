import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PigState, PigAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Pig } from "./Pig.js";

export const pigSettings = {
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["50", "100", "200"] as const,
    default: "100" as const,
  },
  botStrategy: {
    kind: "enum" as const,
    label: "Bot strategy",
    options: ["cautious", "aggressive", "hold-at-20"] as const,
    default: "hold-at-20" as const,
  },
} as const;

type PigSettingsType = SettingsOf<typeof pigSettings>;

export const pigPlugin: GamePlugin<PigState, PigAction, typeof pigSettings> = {
  id: "pig",
  title: "Pig",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push-your-luck dice race to the target. Roll a 1 and lose your turn score.",
  settings: pigSettings,
  initialState: (seed: number, settings: PigSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Pig,
};
