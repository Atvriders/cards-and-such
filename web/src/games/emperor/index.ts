import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EmperorState, EmperorAction } from "./state.js";
import { initialState, reducer, isTerminal, emperorRuleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Emperor = /* @__PURE__ */ lazy(() => import("./Emperor.js").then((mod) => ({ default: mod.Emperor as unknown as React.ComponentType<unknown> })));
export const emperorSettings = {} as const;

type EmperorSettings = SettingsOf<typeof emperorSettings>;

export const emperorPlugin: GamePlugin<EmperorState, EmperorAction, typeof emperorSettings> = {
  id: "emperor",
  title: "Emperor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Klondike variant. 10 columns with face-down cards, alternate-color tableau.",
  howToPlay: `Move all 104 cards (two decks) to the eight foundations to win.

Deal: Ten tableau columns of four cards each — the bottom three are face-down and only the top card is face-up (40 cards total). Eight foundations sit at top-right. The remaining 64 cards form the stock. No redeals.

Tableau: Build down in alternating colors — red on black, black on red — just like Klondike. Valid alternating-color descending sequences may be moved as groups. When a face-down card is uncovered, it flips face-up automatically. Empty columns accept any card or sequence.

Stock: Click to flip one card at a time to the waste. The waste top is always playable. There is no redeal, so each stock card is precious.

Foundations: Build up in suit from Ace to King. Two foundations per suit because two decks are used.

Scoring: +10 per card placed on a foundation.

Strategy: Uncover face-down cards as quickly as possible — they contain hidden opportunities. Manage empty columns carefully. Unlike Klondike the stock has no redeal, so avoid drawing unless you have a plan for the new card.`,
  settings: emperorSettings,
  initialState: (seed: number, settings: EmperorSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: EmperorState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, emperorRuleset)) {
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
  component: Emperor,
};
