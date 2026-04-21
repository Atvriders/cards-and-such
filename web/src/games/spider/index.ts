import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiderState, SpiderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spider } from "./Spider.js";

export const spiderSettings = {
  suits: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["1", "2", "4"] as const,
    default: "1" as const,
  },
} as const;

type SpiderSettings = SettingsOf<typeof spiderSettings>;

export const spiderPlugin: GamePlugin<SpiderState, SpiderAction, typeof spiderSettings> = {
  id: "spider",
  title: "Spider Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck tableau. Build same-suit descending sequences to remove them.",
  settings: spiderSettings,
  initialState: (seed: number, settings: SpiderSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Spider,
};
