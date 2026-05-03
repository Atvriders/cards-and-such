import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { AlhambraState, AlhambraAction } from "./state.js";
import { initialState, reducer, isTerminal, alhambraRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const alhambraSettings = {} as const;

export const alhambraPlugin: GamePlugin<AlhambraState, AlhambraAction, typeof alhambraSettings> = {
  id: "alhambra",
  title: "Alhambra",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with ascending and descending foundations.",
  howToPlay: `Alhambra is played with two standard decks (104 cards) and features a dual-direction foundation system.

Setup: Deal 12 cards face-up into four tableau columns of three cards each. These are your playable reserve. The remaining 92 cards become the stock. Eight foundation piles sit ready — four build up from Ace to King (same suit), and four build down from King to Ace (same suit).

Stock and Waste: Click the stock to flip one card to the waste pile. The top card of the waste is always playable. You may recycle the waste back into the stock once.

Tableau building: Move a single card from the waste or tableau onto a tableau column if the card is a different color and differs by exactly one rank from the column's top card (either higher or lower). Empty tableau columns accept any card.

Foundations: Send cards from the waste or tableau to foundations whenever the rank and suit match. Up-foundations start with Aces; down-foundations start with Kings.

Goal: Move all 104 cards onto the eight foundations.

Scoring: +10 per card on any foundation. Use Auto-move to sweep all currently playable cards to foundations at once.`,
  settings: alhambraSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: AlhambraState): HintTarget | null => {
    const FOUNDATION_IDS = ["fu1", "fu2", "fu3", "fu4", "fd1", "fd2", "fd3", "fd4"];
    const sources = ["waste", "t1", "t2", "t3", "t4"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, alhambraRuleset)) {
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
  component: Game,
};
