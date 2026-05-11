import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { WestcliffEasyState, WestcliffEasyAction } from "./state.js";
import { initialState, reducer, isTerminal, westcliffEasyRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const WestcliffEasy = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WestcliffEasy as unknown as React.ComponentType<unknown> })));
export const westcliffEasyPlugin: GamePlugin<WestcliffEasyState, WestcliffEasyAction, Record<string, never>> = {
  id: "westcliff-easy",
  title: "Westcliff Easy",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Westcliff with same-suit tableau building — easier than the alternating-color classic.",
  howToPlay: `Westcliff Easy is a friendlier take on Westcliff solitaire. Thirty cards are dealt into ten tableau columns of three cards each; the bottom two cards in each column start face-down and only the top card is face-up. The remaining 22 cards form a stock pile. There is one pass through the stock with no redeals.

The key difference from classic Westcliff: tableau columns build down in the same suit (e.g., 9♠ on 10♠) instead of alternating colors. This makes sequences easier to assemble because you only need to track one color per column.

Foundations: Build each of the four suit foundations up from Ace to King.

Tableau: Only same-suit descending sequences may be moved as a group. When a face-down card becomes exposed, it flips face-up automatically. Empty columns accept any card or valid sequence.

Stock: Click the stock to deal one card at a time to the waste pile. Only the top waste card is in play. Each card appears only once.

Strategy: Uncover face-down cards as quickly as possible. Because building is same-suit, plan to keep columns "pure" — mixing suits on a column wastes space. Watch which suits still need their Ace before committing a long column.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: WestcliffEasyState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, westcliffEasyRuleset)) {
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
  component: WestcliffEasy,
} as unknown as GamePlugin<WestcliffEasyState, WestcliffEasyAction, Record<string, never>>;
