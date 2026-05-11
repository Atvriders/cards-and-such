import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SpiderFourSuitsState, SpiderFourSuitsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpiderFourSuitsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpiderFourSuitsGame as unknown as React.ComponentType<unknown> })));
export const spiderFourSuitsPlugin: GamePlugin<SpiderFourSuitsState, SpiderFourSuitsAction, Record<string, never>> = {
  id: "spider-four-suits",
  title: "Spider (Four Suits)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hard Spider — full two-deck game with all four suits.",
  howToPlay: `Spider (Four Suits) is the hardest standard Spider variant, played with two full 52-card decks for 104 cards across all four suits.

Setup: 10 tableau columns. First 4 with 6 cards (5 face-down + 1 face-up), last 6 with 5. The remaining 50 cards form the stock for 5 deal-rows.

Tableau: Build down by rank. Placing any suit on a higher rank is fine, but multi-card moves require all picked cards to be in same-suit descending order — mixed-suit runs cannot be lifted as a unit.

Goal: Build 8 complete same-suit K→A sequences. Each is automatically removed when complete.

Tips: Same-suit clusters are precious — try to keep them intact. Use empty columns aggressively to disentangle mixed-suit piles. Don't deal from stock unless you're truly stuck — extra cards usually make life harder.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SpiderFourSuitsState): HintTarget | null => {
    // Priority 1: any tableau column whose top two face-up cards form a same-suit descending run.
    const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const id of TABLEAU_IDS) {
      const pile = state.piles.find((p) => p.id === id);
      if (!pile || pile.cards.length < 2) continue;
      const faceUp = pile.faceUpCount ?? 0;
      if (faceUp < 2) continue;
      const top = pile.cards[pile.cards.length - 1]!;
      const below = pile.cards[pile.cards.length - 2]!;
      if (top.suit === below.suit && (below.rank as number) === (top.rank as number) + 1) {
        return { selector: `[data-testid="pile-${id}"]`, pulses: 3 };
      }
    }
    // Priority 2: deal another row if all columns have cards and stock has >= 10.
    const stock = state.piles.find((p) => p.id === "stock");
    const allFilled = TABLEAU_IDS.every((id) => {
      const p = state.piles.find((pp) => pp.id === id);
      return p && p.cards.length > 0;
    });
    if (stock && stock.cards.length >= 10 && allFilled) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: SpiderFourSuitsGame,
} as unknown as GamePlugin<SpiderFourSuitsState, SpiderFourSuitsAction, Record<string, never>>;
