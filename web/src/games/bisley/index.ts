import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { BisleyState, BisleyAction } from "./state.js";
import { initialState, reducer, isTerminal, bisleyRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Game as unknown as React.ComponentType<unknown> })));
export const bisleySettings = {} as const;

export const bisleyPlugin: GamePlugin<BisleyState, BisleyAction, typeof bisleySettings> = {
  id: "bisley",
  title: "Bisley",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aces auto-start foundations; build up and down in the same suit.",
  howToPlay: `Bisley is an elegant open solitaire played with one standard deck of 52 cards.

Setup: All four Aces are removed from the shuffled deck and placed on the table as the "up" foundations. The remaining 48 cards are dealt face-up into 12 columns of four cards each. These are your tableau columns.

Foundations: There are eight foundation piles — four "up" piles (one per suit, building from Ace up to King) and four "down" piles (one per suit, building from King down to Ace). Only the top card of each foundation is active. When an up-foundation and a down-foundation of the same suit meet, that suit is complete.

Tableau building: You may move the top card of any tableau column onto another column if the two cards are the same suit and differ by exactly one rank (either up or down). Empty columns are free spaces for any card.

Goal: Transfer all 52 cards onto the eight foundation piles.

Tips: The two-way build direction on both tableau and foundations makes Bisley more flexible than many games. However, with all cards visible from the start, the challenge is avoiding deadlocks — watch for cards of the same suit blocking each other's paths.

Scoring: +10 per card moved to a foundation. Use Auto-move to sweep obvious plays.`,
  settings: bisleySettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: BisleyState): HintTarget | null => {
    const FOUNDATION_IDS = ["fu1", "fu2", "fu3", "fu4", "fd1", "fd2", "fd3", "fd4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, bisleyRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Game,
};
