import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { KlondikeThreesStandardState, KlondikeThreesStandardAction } from "./state.js";
import { initialState, reducer, isTerminal, k3sRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const KlondikeThreesStandardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KlondikeThreesStandardGame as unknown as React.ComponentType<unknown> })));
export const klondikeThreesStandardPlugin: GamePlugin<KlondikeThreesStandardState, KlondikeThreesStandardAction, Record<string, never>> = {
  id: "klondike-threes-standard",
  title: "Klondike by Threes (Standard)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with draw-3 and standard scoring; unlimited redeals.",
  howToPlay: `Klondike by Threes (Standard) is the casino-spec draw-three Klondike with classic point scoring and unlimited redeals.

Setup: 7 tableau columns (1–7 cards, top face-up), 24-card stock, 4 foundations.

Draw: Click the stock to flip three cards face-up to the waste pile. Only the top of those three is playable. When the stock is empty, click again to recycle the waste back into the stock — there is no redeal limit.

Tableau: Build down in alternating colors. Move single cards or valid alt-color sequences. Empty columns accept Kings only.

Scoring (standard): +10 for any card to a foundation. +5 for waste-to-tableau plays. +5 every time a face-down tableau card is revealed by a move.

Tips: With draw-3, plan ahead — buried cards rotate slowly. Use Auto-move once the endgame is trivial.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: KlondikeThreesStandardState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, k3sRuleset)) {
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
  component: KlondikeThreesStandardGame,
};
