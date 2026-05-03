import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { WhiteheadState, WhiteheadAction } from "./state.js";
import { initialState, reducer, isTerminal, whiteheadRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Whitehead = /* @__PURE__ */ lazy(() => import("./Whitehead.js").then((mod) => ({ default: mod.Whitehead as unknown as React.ComponentType<unknown> })));
export const whiteheadSettings = {} as const;

export const whiteheadPlugin: GamePlugin<WhiteheadState, WhiteheadAction, typeof whiteheadSettings> = {
  id: "whitehead",
  title: "Whitehead",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike variant where all cards are dealt face-up and build same-color down.",
  howToPlay: `Whitehead is a Klondike variant with two key twists: all tableau cards are dealt face-up from the start, and the tableau builds by same color rather than alternating color.

Deal: Seven columns are dealt in the classic Klondike triangle — 1, 2, 3, 4, 5, 6, 7 cards. Unlike Klondike, every card is face-up from the start, so you can see the entire layout immediately. The remaining 24 cards form the stock.

Tableau: Columns build downward in same color — a red card goes on a red card one rank higher. A 7 of hearts goes on an 8 of diamonds, for example. However, only a valid same-suit consecutive sequence may be moved as a group. Moving a single card is always allowed. Empty columns accept any card.

Stock: Click the stock to draw one card at a time to the waste pile. There is no redeal — once the stock is exhausted, the waste stays.

Foundations: Build each suit from Ace up to King. Cards in the waste pile are playable to tableau or foundations.

Scoring: +10 per card moved to a foundation.

Tips: With all cards visible, plan your same-color stacks carefully before drawing from the stock. Same-color building means more matching opportunities but fewer valid groups to move.`,
  settings: whiteheadSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: WhiteheadState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, whiteheadRuleset)) {
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
  component: Whitehead,
};
