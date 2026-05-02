import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SpideretteState, SpideretteAction } from "./state.js";
import { initialState, reducer, isTerminal, spideretteRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Spiderette } from "./Spiderette.js";

export const spideretteSettings = {} as const;

export const spiderettePlugin: GamePlugin<SpideretteState, SpideretteAction, typeof spideretteSettings> = {
  id: "spiderette",
  title: "Spiderette",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Single-deck Spider. Build same-suit descending sequences from King to Ace to remove them.",
  howToPlay: `Spiderette is a single-deck version of Spider Solitaire played on seven tableau columns. Your goal is to complete all four same-suit King-to-Ace sequences, which are automatically removed when finished.

Deal: 52 cards fill seven tableau columns in the classic triangle pattern — column 1 gets 1 card, column 2 gets 2, and so on up to column 7 with 7 cards. Only the top card of each column is face-up. The remaining 24 cards form the stock.

Moves: Build tableau columns downward in the same suit only — a 7 of hearts goes on an 8 of hearts. You may pick up and move any face-up sequence of same-suit consecutive cards as a group. Empty columns accept any card or group.

Stock: Click the stock to deal one card face-up to each of the seven columns. You must deal when stuck; you can only deal if the stock has 7 or more cards.

Completing a suit: When a K-through-A same-suit run appears at the bottom of a column, it is automatically removed. Remove all four suits to win.

Scoring: Starts at 500. Each move costs 1 point; each completed suit earns 100 points.

Tips: Prefer building long same-suit runs early. Save empty columns for maneuvering large groups.`,
  settings: spideretteSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: SpideretteState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, spideretteRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: Spiderette,
};
