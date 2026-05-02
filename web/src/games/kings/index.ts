import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { KingsState, KingsAction } from "./state.js";
import { initialState, reducer, isTerminal, kingsRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Game } from "./Game.js";

export const kingsSettings = {} as const;

export const kingsPlugin: GamePlugin<KingsState, KingsAction, typeof kingsSettings> = {
  id: "kings",
  title: "Kings",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13 columns of 4 cards — unbury the four Kings and remove them.",
  howToPlay: `Kings is a relaxed solitaire game played with one standard 52-card deck.

Setup: All 52 cards are dealt face-up into 13 columns of four cards each. There is no stock or waste — everything is visible from the start.

Goal: Remove all four Kings from the tableau by moving them onto the four special King foundation slots.

Tableau building: Move single cards only. A card may be placed on top of another tableau card if it is exactly one rank higher, regardless of suit (2 on Ace, 3 on 2, ..., Queen on Jack). An empty column accepts any single card.

Moving Kings: When a King appears on top of a tableau column, drag it (or click it) to one of the four King foundation slots to score.

Strategy: The challenge is sequence-building to uncover buried Kings. Because you can only move one card at a time and rank-only stacking is allowed, plan ahead to create chains that expose the Kings without creating immovable dead-end piles.

Scoring: +20 points for each King sent to a foundation. +5 for each other tableau move.

Tip: Empty columns are precious — use them to shuffle cards around and open up buried Kings. Use the Remove Kings button to sweep any exposed Kings to foundations automatically.`,
  settings: kingsSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: KingsState): HintTarget | null => {
    const FOUNDATION_IDS = ["k1", "k2", "k3", "k4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, kingsRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: Game,
};
