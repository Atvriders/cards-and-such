import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Klondike } from "./Klondike.js";

export const klondikeSettings = {
  drawMode: { kind: "enum", label: "Draw", options: ["1", "3"] as const, default: "1" },
  scoringMode: {
    kind: "enum",
    label: "Scoring",
    options: ["standard", "vegas"] as const,
    default: "standard",
  },
} as const;

type KlondikeSettings = SettingsOf<typeof klondikeSettings>;

export const klondikePlugin: GamePlugin<KlondikeState, KlondikeAction, typeof klondikeSettings> = {
  id: "klondike",
  title: "Klondike Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Klondike — build up the foundations from Ace to King.",
  settings: klondikeSettings,
  initialState: (seed: number, settings: KlondikeSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Klondike,
};
