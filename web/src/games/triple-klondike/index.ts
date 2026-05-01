import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TripleKlondikeState, TripleKlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleKlondikeGame } from "./Game.js";

export const tripleKlondikePlugin: GamePlugin<TripleKlondikeState, TripleKlondikeAction, Record<string, never>> = {
  id: "triple-klondike",
  title: "Triple Klondike",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-deck Klondike with 13 tableau columns and 12 foundations.",
  howToPlay: `Triple Klondike uses three standard 52-card decks (156 cards) for an ambitious tableau.

Setup: 13 tableau columns of 1–13 cards (top card face-up). Remaining 65 cards form the stock. 12 foundations await — three complete A→K runs per suit.

Tableau: Build down in alternating colors. Move single cards or alt-color sequences. Empty columns accept Kings only.

Stock: Draw one card per click. Empty stock recycles to a fresh pass.

Goal: Move all 156 cards to the 12 foundations.

Scoring: +10 per foundation card, +5 waste-to-tableau.

Tips: With 13 columns, the field is wide but face-down depth is also enormous. There are twelve Aces in play — track each suit's progress on its dedicated foundation.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: TripleKlondikeGame,
} as unknown as GamePlugin;
