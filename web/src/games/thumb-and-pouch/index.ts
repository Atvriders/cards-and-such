import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThumbAndPouchState, ThumbAndPouchAction } from "./state.js";
import { initialState, reducer, isTerminal, thumbRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { ThumbAndPouch } from "./ThumbAndPouch.js";

export const thumbAndPouchSettings = {} as const;

type ThumbAndPouchSettings = SettingsOf<typeof thumbAndPouchSettings>;

export const thumbAndPouchPlugin: GamePlugin<ThumbAndPouchState, ThumbAndPouchAction, typeof thumbAndPouchSettings> = {
  id: "thumb-and-pouch",
  title: "Thumb and Pouch",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A forgiving Klondike variant — build tableau down by any suit except the same suit.",
  howToPlay: `Thumb and Pouch is a relaxed Klondike variant. The layout is identical to Klondike — seven tableau columns with 1–7 cards (only the top card face-up), a stock, waste, and four foundations — but the building rule is friendlier.

Goal: Move all 52 cards to the four foundation piles, building each up from Ace to King in the same suit.

Tableau rule: Build down by any suit EXCEPT the same suit. This means a red card can go on a red card of a different suit, or on a black card, as long as the rank decreases by one. For example, 8♥ accepts 7♦, 7♣, or 7♠ — but not 7♥.

Because three suits are always acceptable (vs. two in Klondike's alternating-color rule), more moves are available and sequences are easier to form. Multi-card sequences can be moved as long as each card in the sequence also satisfies the any-except-same-suit rule.

Stock & Waste: Click to draw one card at a time. When the stock empties, click again to recycle all waste cards back.

Tips: The relaxed building rule means you can form longer sequences more easily. Prioritize getting Aces and Twos to foundations early. Empty columns are still powerful — use them to reorder long sequences.`,
  settings: thumbAndPouchSettings,
  initialState: (seed: number, _settings: ThumbAndPouchSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: ThumbAndPouchState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, thumbRuleset)) {
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
  component: ThumbAndPouch,
};
