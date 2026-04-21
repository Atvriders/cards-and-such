import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeartsState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Hearts } from "./Hearts.js";

export const heartsSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bots",
    options: ["random", "heuristic"] as const,
    default: "heuristic" as const,
  },
} as const;

type HeartsSettingsType = SettingsOf<typeof heartsSettings>;

type HeartsAction = { type: "play"; cardId: string };

export const heartsPlugin: GamePlugin<HeartsState, HeartsAction, typeof heartsSettings> = {
  id: "hearts",
  title: "Hearts",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-player trick-taking — avoid hearts and the Queen of Spades.",
  settings: heartsSettings,
  initialState: (seed: number, settings: HeartsSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Hearts,
};
