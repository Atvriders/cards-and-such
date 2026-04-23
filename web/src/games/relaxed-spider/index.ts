import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RelaxedSpiderState, RelaxedSpiderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RelaxedSpider } from "./RelaxedSpider.js";

export const relaxedSpiderSettings = {
  suits: {
    kind: "enum" as const,
    label: "Suits",
    options: ["1", "2", "4"] as const,
    default: "1" as const,
  },
} as const;

type RSSettings = SettingsOf<typeof relaxedSpiderSettings>;

export const relaxedSpiderPlugin: GamePlugin<RelaxedSpiderState, RelaxedSpiderAction, typeof relaxedSpiderSettings> = {
  id: "relaxed-spider",
  title: "Relaxed Spider",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spider with a relaxed removal rule — any K-to-A descending sequence auto-removes, regardless of suit.",
  howToPlay: `Relaxed Spider plays identically to standard Spider with one key rule change that makes it significantly more approachable.

Setup: Ten tableau columns — the first four hold 6 cards each, the remaining six hold 5 cards each (54 total). Only the top card of each column is face-up. The remaining 50 cards form the stock. You can play with 1, 2, or 4 suits.

Goal: Form eight complete K-to-A descending sequences on the tableau. Each completed sequence is automatically removed.

Difference from standard Spider: In standard Spider, the auto-removed sequence must be the same suit throughout. In Relaxed Spider, any 13-card K-to-A descending sequence is automatically removed regardless of suit. This means you can build sequences across suits and still complete them.

Tableau movement: Place a card on any tableau top that is exactly one rank higher. You may pick up and move any descending sequence (no suit restriction on the sequence you pick up).

Stock: Click the stock to deal one card face-up to each of the ten columns simultaneously. You cannot deal if any column is empty.

Tips: The relaxed removal rule allows sequences of mixed suits to count. Take advantage of this — you no longer need to keep suits perfectly aligned to complete a sequence. Focus on uncovering face-down cards as quickly as possible.`,
  settings: relaxedSpiderSettings,
  initialState: (seed: number, settings: RSSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RelaxedSpider,
};
