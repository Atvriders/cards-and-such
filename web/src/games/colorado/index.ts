import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ColoradoState, ColoradoAction, ColoradoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Colorado } from "./Colorado.js";

export const coloradoSettings = {} as const;

export const coloradoPlugin: GamePlugin<ColoradoState, ColoradoAction, typeof coloradoSettings> = {
  id: "colorado",
  title: "Colorado",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire — build 8 foundations A to K by playing top cards from 20 piles, dealt row by row.",
  howToPlay: `Colorado is a two-deck (104-card) solitaire named for its wide, open layout. Twenty piles are laid out in a grid, each starting with two face-up cards. The remaining sixty-four cards wait in the stock.

Goal: move all 104 cards to the eight foundations (two per suit), building each foundation from Ace to King in its own suit.

Play: only the top card of each pile is available. Select a pile by clicking it (highlighted in blue), then click a foundation to send its top card there — but only if it is the correct next rank and suit. You can also click a different pile to reselect.

When you are stuck or want to uncover buried cards, click "Deal row" to deal one new card face-up to each pile from the stock. You may deal up to four additional rows (five total including the opening deal).

There is no tableau-to-tableau movement — all play goes directly to the foundations. This makes Colorado a game of patience and timing: identify which cards are blocking Aces and twos, and deal new rows strategically to uncover them before the stock runs out.

Score: 5 points per card placed on a foundation. A perfect game scores 520 points.`,
  settings: coloradoSettings,
  initialState: (seed: number) => initialState(seed, {} as ColoradoSettings),
  reducer,
  isTerminal,
  component: Colorado,
};
