import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { EightOffState, EightOffAction } from "./state.js";
import { initialState, reducer, isTerminal, eightOffRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const EightOff = /* @__PURE__ */ lazy(() => import("./EightOff.js").then((mod) => ({ default: mod.EightOff as unknown as React.ComponentType<unknown> })));
export const eightOffSettings = {} as const;

export const eightOffPlugin: GamePlugin<EightOffState, EightOffAction, typeof eightOffSettings> = {
  id: "eight-off",
  title: "Eight Off",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell with 8 free cells and same-suit tableau building.",
  howToPlay: `Eight Off is a FreeCell variant that gives you eight free cells instead of four — but compensates by requiring same-suit builds on the tableau instead of alternating colors.

Deal: All 52 cards fill eight cascades (six cards each = 48 cards), all face-up. The remaining four cards start pre-loaded in four of the eight free cells.

Cells: Each of the eight free cells can hold exactly one card at a time. Use cells to temporarily park cards that are blocking important moves. Having eight cells gives you tremendous flexibility — but don't fill them all, or you'll have nowhere to move.

Tableau: Build cascades downward in the same suit. A 7 of clubs goes on an 8 of clubs, not an 8 of hearts. You may pick up and move a same-suit consecutive sequence together. Empty cascades can accept any card.

Foundations: Build each suit up from Ace to King. Once a card is on a foundation, it stays there. Use Auto-move to send all safe cards to foundations at once.

Scoring: +10 per card moved to a foundation.

Tips: Plan suit builds carefully — the same-suit rule means you'll need specific cards to extend runs. Eight cells feel generous, but filling them all locks the game.`,
  settings: eightOffSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: EightOffState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, eightOffRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: EightOff,
};
