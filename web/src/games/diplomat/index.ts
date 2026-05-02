import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiplomatState, DiplomatAction } from "./state.js";
import { initialState, reducer, isTerminal, diplomatRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Diplomat } from "./Diplomat.js";

export const diplomatSettings = {} as const;

type DiplomatSettings = SettingsOf<typeof diplomatSettings>;

export const diplomatPlugin: GamePlugin<DiplomatState, DiplomatAction, typeof diplomatSettings> = {
  id: "diplomat",
  title: "Diplomat",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire. 8 columns, build down any suit. Stock deals 1 card at a time.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Eight tableau columns of four face-up cards each (32 cards). Eight foundations at top-right — two per suit. The remaining 72 cards form the stock at top-left. No redeals.

Tableau: Build down by rank regardless of suit — any 6 may land on any 7. Valid sequences (descending rank) may be moved together. Empty columns accept any card or sequence.

Stock: Click to flip one card at a time to the waste. The waste top is always playable. No redeal — use the stock wisely.

Foundations: Build each foundation up in suit from Ace to King. Since two decks are used, each suit has two foundations.

Scoring: +10 per card moved to a foundation.

Strategy: The any-suit tableau rule makes Diplomat more flexible than Forty Thieves. Focus on uncovering buried cards from the stock quickly. Use empty columns as relay points to build longer sequences. Coordinate all eight foundations simultaneously so one suit doesn't lag far behind the others.`,
  settings: diplomatSettings,
  initialState: (seed: number, settings: DiplomatSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: DiplomatState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, diplomatRuleset)) {
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
  component: Diplomat,
};
