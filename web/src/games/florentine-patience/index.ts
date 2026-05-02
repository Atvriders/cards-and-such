import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FlorentineState, FlorentineAction } from "./state.js";
import { FlorentineGame } from "./Game.js";

const settings = {} as const;

export const florentinePlugin: GamePlugin<FlorentineState, FlorentineAction, typeof settings> = {
  id: "florentine-patience",
  title: "Florentine",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A tableau-and-reserve solitaire building same-suit sequences downward.",
  howToPlay: `Florentine Patience is an elegant Italian solitaire named after the city of Florence. It uses a tableau of five columns, a four-card reserve, and a stock.

Setup: Deal 25 cards face-up into five tableau columns of five cards each. Place four more cards face-up in the reserve. The remaining 23 cards form the stock.

Goal: Build four foundation piles, one per suit, from Ace up to King in sequence.

Tableau rules: Move the top card of any column onto another column's top card if it is one rank lower AND the same suit. Only single-card moves are allowed. Empty columns may receive any single card.

Reserve: The four reserve slots hold individual cards that can be moved to any valid tableau position or directly to a foundation. When a reserve slot empties, draw from the stock to refill it.

Foundations: Send any top card that fits (next in suit sequence from the current top) to its foundation pile.

Stock: Click to deal one card to each empty reserve slot. There is no redeal. Manage the reserve carefully — those four slots are your only buffer when the tableau is locked.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: FlorentineGame,
};
