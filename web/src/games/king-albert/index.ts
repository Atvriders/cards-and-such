import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { KingAlbertState, KingAlbertAction } from "./state.js";
import { initialState, reducer, isTerminal, kingAlbertRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const KingAlbert = /* @__PURE__ */ lazy(() => import("./KingAlbert.js").then((mod) => ({ default: mod.KingAlbert as unknown as React.ComponentType<unknown> })));
export const kingAlbertSettings = {} as const;

export const kingAlbertPlugin: GamePlugin<KingAlbertState, KingAlbertAction, typeof kingAlbertSettings> = {
  id: "king-albert",
  title: "King Albert",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A no-stock solitaire: build foundations from a 9-column layout with a 7-card reserve.",
  howToPlay: `King Albert is a patience solitaire named after the Belgian king. It uses no stock — all 52 cards are visible from the start.

Deal: Nine tableau columns receive 1, 2, 3, 4, 5, 6, 7, 8 and 9 cards respectively, all face-up. The seven leftover cards form a reserve of individually accessible single-card piles.

Goal: Move all 52 cards to the four foundation piles, built up from Ace to King in suit.

Moves: The top card of any tableau column or reserve pile may be moved to another tableau column or to a foundation. On tableau columns, cards stack descending in alternating colors (red on black, black on red). Any card or legal sequence may fill an empty column.

Multi-card sequences may be moved if you have enough empty columns or piles to temporarily hold intermediate cards.

Strategy: Since all cards are visible, the game is purely strategic. Use the reserve cards to fill gaps in your sequences. Plan well ahead — once you bury a key card under a long sequence it can be hard to rescue.

Win condition: All 52 cards on the four foundations in Ace-through-King suit order.`,
  settings: kingAlbertSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: KingAlbertState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, kingAlbertRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: KingAlbert,
};
