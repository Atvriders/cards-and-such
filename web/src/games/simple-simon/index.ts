import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SimpleSimonState, SimpleSimonAction } from "./state.js";
import { initialState, reducer, isTerminal, simpleSimonRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const SimpleSimon = /* @__PURE__ */ lazy(() => import("./SimpleSimon.js").then((mod) => ({ default: mod.SimpleSimon as unknown as React.ComponentType<unknown> })));
export const simpleSimonSettings = {} as const;

type SimpleSimonSettings = SettingsOf<typeof simpleSimonSettings>;

export const simpleSimonPlugin: GamePlugin<SimpleSimonState, SimpleSimonAction, typeof simpleSimonSettings> = {
  id: "simple-simon",
  title: "Simple Simon",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "No stock, no foundations to start. Build K→A same-suit sequences on the tableau.",
  howToPlay: `Clear all 52 cards from the tableau by assembling complete King-to-Ace same-suit sequences.

Deal: All 52 cards are dealt face-up across ten tableau columns — columns 1–4 receive 3 cards each, columns 5–6 receive 4 cards each, and columns 7–10 receive 8 cards each. There is no stock pile and no separate foundation — foundations appear only when a complete sequence is removed.

Tableau: Build down by rank regardless of suit — any 6 may land on any 7. However, only same-suit sequences may be picked up and moved as a group. A single card may always be moved.

Winning: When the top 13 cards of a tableau column form a complete same-suit sequence from King down to Ace, that sequence is automatically removed to a foundation. Remove all four suits to win.

Strategy: Because only same-suit groups move, plan carefully before breaking apart useful sequences. Try to concentrate cards of the same suit in the same column. Empty columns are rare and precious — use them to maneuver large groups. The game rewards careful long-term planning over aggressive moves.`,
  settings: simpleSimonSettings,
  initialState: (seed: number, settings: SimpleSimonSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SimpleSimonState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, simpleSimonRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: SimpleSimon,
};
