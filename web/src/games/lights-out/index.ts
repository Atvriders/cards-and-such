import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LightsOutState, LightsOutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LightsOut } from "./LightsOut.js";

export const lightsOutSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type LightsOutSettingsType = SettingsOf<typeof lightsOutSettings>;

export const lightsOutPlugin: GamePlugin<LightsOutState, LightsOutAction, typeof lightsOutSettings> = {
  id: "lights-out",
  title: "Lights Out",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Turn off all the lights. Each press toggles a cross pattern.",
  settings: lightsOutSettings,
  initialState: (seed: number, settings: LightsOutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LightsOut,
};
