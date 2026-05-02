import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FortyAndEightState, FortyAndEightAction } from "./state.js";
import { initialState, reducer, isTerminal, fortyAndEightRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { FortyAndEight } from "./FortyAndEight.js";

export const fortyAndEightSettings = {} as const;

type FortyAndEightSettings = SettingsOf<typeof fortyAndEightSettings>;

export const fortyAndEightPlugin: GamePlugin<FortyAndEightState, FortyAndEightAction, typeof fortyAndEightSettings> = {
  id: "forty-and-eight",
  title: "Forty and Eight",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck variant of Forty Thieves with 8 columns of 5 cards and one redeal.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Eight tableau columns of five face-up cards each (40 cards total). Eight foundations sit at top-right. The remaining 64 cards form the stock at top-left with one redeal allowed.

Tableau: Build down in the same suit only — a 6♥ may only land on a 7♥. Only one card may be moved at a time. Empty columns accept any single card.

Stock and Waste: Click the stock to flip one card at a time to the waste. The top of the waste is always playable. When the stock is exhausted, click it once more to redeal the waste (one redeal allowed total).

Foundations: Build each foundation up in suit from Ace (A) to King (K). Two foundation piles per suit because two decks are in play.

Scoring: +10 per card moved to a foundation.

Strategy: This game is very challenging. Prioritize clearing waste cards early so the redeal is not wasted. Protect empty columns — they are precious parking spots. Try to form same-suit runs on the tableau to unlock deeper cards and keep foundations advancing in sync.`,
  settings: fortyAndEightSettings,
  initialState: (seed: number, settings: FortyAndEightSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FortyAndEightState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, fortyAndEightRuleset)) {
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
  component: FortyAndEight,
};
