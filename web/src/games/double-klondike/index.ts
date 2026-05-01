import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DoubleKlondikeState, DoubleKlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleKlondikeGame } from "./Game.js";

export const doubleKlondikePlugin: GamePlugin<DoubleKlondikeState, DoubleKlondikeAction, Record<string, never>> = {
  id: "double-klondike",
  title: "Double Klondike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike with 9 tableau columns and 8 foundations.",
  howToPlay: `Double Klondike uses two standard 52-card decks (104 cards) shuffled together.

Setup: 9 tableau columns are dealt with 1–9 cards (top card face-up). The remaining 59 cards form the stock. 8 foundation piles await — two complete A→K runs per suit.

Tableau: Build down in alternating colors. Move single cards or valid alt-color sequences. Empty columns accept Kings only.

Stock: Draw one card at a time to the waste. Click again on empty stock to recycle (unlimited redeals).

Goal: Move all 104 cards onto the 8 foundations, each going Ace through King in a single suit.

Scoring: +10 per foundation, +5 waste-to-tableau.

Tips: With two decks there are eight Aces to find — plan for both copies of each rank. Rather than rushing low cards to foundations, keep one or two on the tableau as targets for opposite-color builds.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: DoubleKlondikeGame,
} as unknown as GamePlugin;
