import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FortyEightOneDeckState, FortyEightOneDeckAction, FortyEightOneDeckSettings } from "./state.js";
const FortyEightOneDeck = /* @__PURE__ */ lazy(() => import("./FortyEightOneDeck.js").then((mod) => ({ default: mod.FortyEightOneDeck as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const fortyEightOneDeckPlugin: GamePlugin<FortyEightOneDeckState, FortyEightOneDeckAction, typeof settings> = {
  id: "forty-eight-one-deck",
  title: "Forty and Eight — One Deck",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A compact single-deck variant of Forty and Eight with free cells and same-suit descending build.",
  howToPlay: `Forty and Eight — One Deck is a condensed version of the classic two-deck Forty and Eight solitaire, shrunk to fit a single 52-card deck.

Layout: Four tableau columns each receive 5 face-up cards (20 cards total). Four foundations will be built up from Ace to King, one per suit. Four free cells provide temporary parking spots. The remaining 32 cards form the stock.

Tableau rules: build columns downward in the same suit, one card at a time. Only a single card may be moved at once. An empty column accepts any card.

Free cells: each of the four free cells holds at most one card. Use them to maneuver cards into position, but remember they fill fast and take planning to empty.

Stock: click to draw one card at a time to the waste pile. The waste top is always playable. There is no redeal.

Foundation: send cards to the four foundations in ascending order A–2–3–…–K, same suit. A foundation pile only accepts the next card in sequence for its suit.

Click a card to select it (highlighted), then click the destination pile to move it. Strategy requires careful use of the four free cells to avoid deadlock.`,
  settings,
  initialState: (seed: number, _settings: FortyEightOneDeckSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: FortyEightOneDeck,
};
