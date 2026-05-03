import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AustralianPatienceState, AustralianPatienceAction } from "./state.js";
const AustralianPatienceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AustralianPatienceGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const australianPatiencePlugin: GamePlugin<AustralianPatienceState, AustralianPatienceAction, typeof settings> = {
  id: "australian-patience",
  title: "Australian Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A relaxed solitaire where tableau columns build down regardless of suit.",
  howToPlay: `Australian Patience (also called Aussie) is a solitaire variant where tableau columns build downward in rank with no suit restriction — any seven can go on any eight, making it considerably more forgiving than Klondike.

Setup: The full 52-card deck is dealt into 7 tableau columns. The first four columns receive 6 cards each; the last three receive 5 cards each. All cards are face-up from the start. The remaining 9 cards form a stock pile.

Goal: Build four foundation piles, one per suit, from Ace up to King.

Play: Move the top card (or a sequence of consecutively ranked cards) from any tableau column onto another column's top card, provided the moved card is one rank lower than the receiving card. Suit doesn't matter for tableau builds. You may also move any top card directly to a matching foundation. When you want more options, deal one card from the stock to each tableau column (one pass only, no redeal).

Empty columns accept any card or sequence. Plan your foundation builds and use empty columns as staging areas. The stock gives you one bonus deal — time it wisely for maximum flexibility.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: AustralianPatienceGame,
};
