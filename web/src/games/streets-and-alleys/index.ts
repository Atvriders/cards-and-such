import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { StreetsAndAlleysState, StreetsAndAlleysAction } from "./state.js";
import { initialState, reducer, isTerminal, streetsRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const StreetsAndAlleys = /* @__PURE__ */ lazy(() => import("./StreetsAndAlleys.js").then((mod) => ({ default: mod.StreetsAndAlleys as unknown as React.ComponentType<unknown> })));
export const streetsAndAlleysSettings = {} as const;

export const streetsAndAlleysPlugin: GamePlugin<StreetsAndAlleysState, StreetsAndAlleysAction, typeof streetsAndAlleysSettings> = {
  id: "streets-and-alleys",
  title: "Streets and Alleys",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eight rows, four foundations. Build down in any suit, up same-suit on foundations.",
  howToPlay: `All 52 cards are dealt face-up into eight tableau rows — four rows of seven and four rows of six. The four foundations start empty. Your goal is to build each foundation up from Ace to King by suit.

Moves: Only the rightmost (outermost) card of each tableau row can be moved. Move it to a foundation (Ace first, then up same-suit) or onto the end of another row (building down by rank, any suit). Empty rows accept any single card.

Difference from Beleaguered Castle: The Aces are buried in the tableau, so your first challenge is uncovering them. This makes Streets and Alleys somewhat harder than Beleaguered Castle.

Strategy: Prioritize finding and freeing the Aces early — no foundation can start until its Ace is uncovered. Keep tableau rows as short as possible to create empty rows, which act as vital maneuvering spaces. Think of empty rows as free cells: use them carefully and never leave a card there permanently if you can avoid it. Look for chains of moves that free multiple cards at once.

Winning: All 52 cards on the four foundations, each topped by a King. Careful planning from the first move is essential.`,
  settings: streetsAndAlleysSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: StreetsAndAlleysState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, streetsRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: StreetsAndAlleys,
};
