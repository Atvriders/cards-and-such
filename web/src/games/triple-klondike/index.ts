import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { TripleKlondikeState, TripleKlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal, tripleKlondikeRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
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
  hint: (state: TripleKlondikeState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, tripleKlondikeRuleset)) {
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
  component: TripleKlondikeGame,
} as unknown as GamePlugin;
