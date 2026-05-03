import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { KlondikeNoRedealState, KlondikeNoRedealAction } from "./state.js";
import { initialState, reducer, isTerminal, klondikeNoRedealRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const KlondikeNoRedealGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.KlondikeNoRedealGame as unknown as React.ComponentType<unknown> })));
export const klondikeNoRedealPlugin: GamePlugin<KlondikeNoRedealState, KlondikeNoRedealAction, Record<string, never>> = {
  id: "klondike-no-redeal",
  title: "Klondike (No Redeal)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with a single pass through the stock — no recycling.",
  howToPlay: `Klondike (No Redeal) plays exactly like classic Klondike but you only get a single pass through the stock — once all cards are turned over to the waste, that's it. There is no recycling.

Setup: Seven tableau columns hold 1–7 cards (only the top card of each face-up). The remaining 24 cards form the stock. Foundations sit empty, ready to be filled Ace to King by suit.

Moves: Build down on tableau in alternating colors. Empty columns accept Kings only. Move single cards or full alt-color sequences. Click a card to auto-route it to the best legal destination. Drag the stock to flip one card to the waste — there is no draw-3 here, just one card per click.

Goal: Move all 52 cards to the four foundations. With no second pass through the stock, this is meaningfully harder than standard Klondike. You must make every waste card count.

Tips: Be very deliberate when emptying the stock — each card you fail to play is one you'll never see again. Empty a tableau column for Kings as early as you can.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: KlondikeNoRedealState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, klondikeNoRedealRuleset)) {
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
  component: KlondikeNoRedealGame,
} as unknown as GamePlugin;
