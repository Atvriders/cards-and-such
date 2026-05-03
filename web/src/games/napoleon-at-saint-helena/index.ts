import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { NapoleonState, NapoleonAction } from "./state.js";
import { initialState, reducer, isTerminal, napoleonRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const NapoleonAtSaintHelena = /* @__PURE__ */ lazy(() => import("./NapoleonAtSaintHelena.js").then((mod) => ({ default: mod.NapoleonAtSaintHelena as unknown as React.ComponentType<unknown> })));
export const napoleonAtSaintHelenaSettings = {} as const;

export const napoleonAtSaintHelenaPlugin: GamePlugin<NapoleonState, NapoleonAction, typeof napoleonAtSaintHelenaSettings> = {
  id: "napoleon-at-saint-helena",
  title: "Napoleon at St. Helena",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A demanding two-deck solitaire: 10 tableau columns, 8 foundations, same-suit builds.",
  howToPlay: `Napoleon at St. Helena is a challenging two-deck patience game. All 104 cards must be sorted into eight foundation piles — two per suit — built up from Ace to King.

Deal: Ten tableau columns each receive four face-up cards (40 total). The remaining 64 cards form the stock.

Foundations: Eight piles (two per suit). Each must be started with an Ace and built up through King in the same suit.

Tableau rules: You may place a single card on another tableau card only if both cards share the same suit and the card being placed is exactly one rank lower. For example, the 7 of clubs goes onto the 8 of clubs. Empty tableau columns accept any card.

Stock: Draw one card at a time to the waste pile. The waste top card is always playable. Once the stock is exhausted the waste may be recycled once.

Strategy: The same-suit constraint and massive stock make this a very difficult game. Try to build runs in the tableau quickly to free up empty columns. Each empty column is a precious temporary holding spot. Prioritize getting Aces to foundations early.

Win condition: All 104 cards on the eight foundations.`,
  settings: napoleonAtSaintHelenaSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: NapoleonState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, napoleonRuleset)) {
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
  component: NapoleonAtSaintHelena,
};
