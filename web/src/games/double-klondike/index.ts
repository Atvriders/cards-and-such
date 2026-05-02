import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { DoubleKlondikeState, DoubleKlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal, doubleKlondikeRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
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
  hint: (state: DoubleKlondikeState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, doubleKlondikeRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    const waste = state.piles.find((p) => p.id === "waste");
    if (waste && waste.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: DoubleKlondikeGame,
} as unknown as GamePlugin;
