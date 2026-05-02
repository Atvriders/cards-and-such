import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EasthavenState, EasthavenAction } from "./state.js";
import { initialState, reducer, isTerminal, easthavenRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
import { Easthaven } from "./Easthaven.js";

export const easthavenSettings = {} as const;

type EasthavenSettings = SettingsOf<typeof easthavenSettings>;

export const easthavenPlugin: GamePlugin<EasthavenState, EasthavenAction, typeof easthavenSettings> = {
  id: "easthaven",
  title: "Easthaven",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A compact Spider-like game — 7 columns, alternating-color tableau, deal 7 at a time from stock.",
  howToPlay: `Easthaven is a compact solitaire that sits between Klondike and Spider in style and difficulty.

Setup: Seven tableau columns each start with 3 cards. Only the top card of each column is face-up; the other two are face-down. The remaining 31 cards form the stock. Four foundations start empty.

Goal: Build all four foundations from Ace up to King in the same suit.

Tableau rules: Build columns down in alternating colors (red on black, black on red), just like Klondike. You may move single cards or valid alternating-color sequences. Empty columns accept any card.

Stock: Click the stock to deal one card face-up to each of the seven columns simultaneously. Each dealt card reveals itself and extends the column. You cannot deal if the stock is empty.

Foundation rules: Move Aces to foundations as soon as they appear, then build up in the same suit: A, 2, 3, … K.

Tips: Unlike Klondike there is no waste pile — cards come out in rows of seven, so you cannot selectively draw. Plan tableau moves before each deal to ensure as many columns as possible can accept their new card. Clearing columns to empty is valuable but harder than in Klondike since columns start with 3 hidden cards.`,
  settings: easthavenSettings,
  initialState: (seed: number, _settings: EasthavenSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: EasthavenState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, easthavenRuleset)) {
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
  component: Easthaven,
};
