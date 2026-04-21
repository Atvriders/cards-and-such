import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwoFortyEightState, TwoFortyEightAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyFortyEight } from "./TwentyFortyEight.js";

export const twoFortyEightSettings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["1024", "2048", "4096"] as const,
    default: "2048" as const,
  },
} as const;

type TwoFortyEightSettingsType = SettingsOf<typeof twoFortyEightSettings>;

export const twoFortyEightPlugin: GamePlugin<
  TwoFortyEightState,
  TwoFortyEightAction,
  typeof twoFortyEightSettings
> = {
  id: "2048",
  title: "2048",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide tiles to merge. Reach 2048 (or higher).",
  settings: twoFortyEightSettings,
  initialState: (seed: number, settings: TwoFortyEightSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  component: TwentyFortyEight,
};
