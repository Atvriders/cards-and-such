import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { DeucesSolitaireState, DeucesSolitaireAction } from "./state.js";
import { initialState, reducer, isTerminal, deucesRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { DeucesSolitaire } from "./DeucesSolitaire.js";

export const deucesSolitaireSettings = {} as const;

export const deucesSolitairePlugin: GamePlugin<DeucesSolitaireState, DeucesSolitaireAction, typeof deucesSolitaireSettings> = {
  id: "deuces-solitaire",
  title: "Deuces",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A no-stock solitaire where the four 2s seed the foundations and sequences wrap around Ace.",
  howToPlay: `Deuces is a fully-open solitaire — all 52 cards are visible from the start, with no stock or draw pile.

Setup: The four 2s are automatically placed on the four foundation piles. The remaining 48 cards are dealt face-up across 10 tableau columns (eight columns of 5 and two columns of 4).

Foundations: Each foundation starts at 2 and builds upward by suit: 2-3-4-5-6-7-8-9-10-J-Q-K-A. Ace is the last card, following King (the sequence wraps around).

Tableau: Columns build downward in alternating colors, exactly like Klondike — a red card on a black card one rank higher, a black card on a red card one rank higher. Any card or legal sequence may be moved to an empty column.

Moves: Only single cards may be moved unless a legal alternating-color descending sequence is picked up together.

Strategy: Since every card is visible, this is a pure strategy game. Look ahead before moving; burying a 3 or 4 under a sequence will stall your foundations. Empty columns are very valuable for maneuvering.

Win condition: All 52 cards on the four foundations, ending with each suit's Ace.`,
  settings: deucesSolitaireSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: DeucesSolitaireState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, deucesRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    return null;
  },
  component: DeucesSolitaire,
};
