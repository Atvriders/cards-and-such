import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CongressState, CongressAction } from "./state.js";
import { initialState, reducer, isTerminal, congressRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Congress = /* @__PURE__ */ lazy(() => import("./Congress.js").then((mod) => ({ default: mod.Congress as unknown as React.ComponentType<unknown> })));
export const congressSettings = {} as const;

type CongressSettings = SettingsOf<typeof congressSettings>;

export const congressPlugin: GamePlugin<CongressState, CongressAction, typeof congressSettings> = {
  id: "congress",
  title: "Congress",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with 8 reserve cells, 4 tableau columns, and a stock.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Eight reserve cells along the top are each pre-filled with one card (8 total). Four tableau columns each receive eight face-up cards (32 total). The remaining 64 cards form the stock. Eight foundations at top-right must each be built up in suit from Ace to King.

Reserve: Each of the eight reserve slots holds one card. You may move a reserve card to a foundation or onto a tableau column, or park a single card from the tableau into an empty reserve slot.

Tableau: Build down by rank, any suit — a 7 of any suit may land on any 8. Sequences may be moved together. Empty tableau columns accept any card or sequence.

Stock: Click to flip one card at a time to the waste. No redeal.

Scoring: +10 per card moved to a foundation.

Strategy: The reserves give you crucial extra flexibility. Prioritize moving reserve Aces and 2s to the foundations immediately. Use empty reserve slots sparingly — they fill up fast. Plan sequence moves carefully; tableau columns can grow long and become hard to rearrange.`,
  settings: congressSettings,
  initialState: (seed: number, settings: CongressSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CongressState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, congressRuleset)) {
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
  component: Congress,
};
