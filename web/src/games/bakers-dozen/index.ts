import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BakersDozenState, BakersDozenAction } from "./state.js";
import { initialState, reducer, isTerminal, bakersDozRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const BakersDozen = /* @__PURE__ */ lazy(() => import("./BakersDozen.js").then((mod) => ({ default: mod.BakersDozen as unknown as React.ComponentType<unknown> })));
export const bakersDozSettings = {} as const;

type BakersDozenSettings = SettingsOf<typeof bakersDozSettings>;

export const bakersDozPlugin: GamePlugin<BakersDozenState, BakersDozenAction, typeof bakersDozSettings> = {
  id: "bakers-dozen",
  title: "Baker's Dozen",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13 columns of 4 cards, all face-up. Build down in any suit, one card at a time. Kings sink to the bottom at deal.",
  howToPlay: `Baker's Dozen deals all 52 cards face-up into 13 columns of four cards each — the "dozen plus one." There is no stock and no redeal.

Special deal rule: After shuffling, any King in a column is automatically moved to the bottom of that column. This prevents Kings from blocking playable cards from the start.

Objective: Build the four foundations up from Ace to King, each in its own suit.

Tableau rules: You may move only one card at a time. A card may be placed on any tableau column whose top card is exactly one rank higher, regardless of suit — a 7 of any suit plays on any 8. Any card may be placed on an empty column.

Strategy: With all cards visible from the outset, Baker's Dozen is largely a game of planning. Look several moves ahead to avoid burying Aces and low cards under higher ones. Empty columns are valuable — use them to temporarily park blocking cards.

Scoring: +10 for each card moved to a foundation. Use the Auto-move button to send all safely playable cards to the foundations at once.

Tip: Focus on clearing columns rather than filling foundations early. A free column gives you the maneuvering room to unblock buried cards.`,
  settings: bakersDozSettings,
  initialState: (seed: number, settings: BakersDozenSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BakersDozenState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, bakersDozRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: BakersDozen,
};
