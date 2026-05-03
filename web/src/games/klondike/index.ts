import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction } from "./state.js";
import { initialState, reducer, isTerminal, klondikeRuleset } from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const Klondike = /* @__PURE__ */ lazy(() => import("./Klondike.js").then((mod) => ({ default: mod.Klondike as unknown as React.ComponentType<unknown> })));
export const klondikeSettings = {
  drawMode: { kind: "enum", label: "Draw", options: ["1", "3"] as const, default: "1" },
  scoringMode: {
    kind: "enum",
    label: "Scoring",
    options: ["standard", "vegas"] as const,
    default: "standard",
  },
} as const;

type KlondikeSettings = SettingsOf<typeof klondikeSettings>;

export const klondikePlugin: GamePlugin<KlondikeState, KlondikeAction, typeof klondikeSettings> = {
  id: "klondike",
  title: "Klondike Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Klondike — build up the foundations from Ace to King.",
  howToPlay: `Build all four foundation piles up from Ace to King, one pile per suit.

Deal: 7 tableau columns with 1–7 cards, only the top card face-up. The stock (draw pile) and waste live at top-left. The four foundations sit top-right.

Moves: On the tableau, build down in alternating colors (red-on-black). An empty tableau slot accepts any card — Kings especially. Move a single card or a valid descending sequence. Click a card to auto-move to the best legal destination, or drag it manually. Draw from the stock to turn up cards onto the waste; the waste top is playable.

Scoring: Standard scoring awards +10 for moving a card to a foundation, +5 when the waste feeds the tableau, and +5 each time a face-down card is revealed. Vegas scoring starts at −52 and pays +5 per foundation card.

Tips: Build your foundations patiently — don't send every Ace and 2 up immediately if you still need those on the tableau. Empty columns are precious; fill them with Kings. Use Auto-move when you're confident the remaining game is trivial.`,
  settings: klondikeSettings,
  initialState: (seed: number, settings: KlondikeSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: KlondikeState): HintTarget | null => {
    // Priority 1: anything that can move from waste/tableau-tops to a
    // foundation is the strongest "obvious" move.
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    const sources = ["waste", ...TABLEAU_IDS];
    for (const sourceId of sources) {
      const source = state.piles.find((p) => p.id === sourceId);
      if (!source || source.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        const move = { fromPile: sourceId, toPile: foundId, count: 1 };
        if (canMove(state.piles, move, klondikeRuleset)) {
          return { selector: `[data-testid="pile-${sourceId}"]`, pulses: 3 };
        }
      }
    }
    // Priority 2: nothing obvious — point at the stock to encourage drawing.
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    // Priority 3: stock empty but waste has cards — recycle.
    const waste = state.piles.find((p) => p.id === "waste");
    if (waste && waste.cards.length > 0) {
      return { selector: `[data-testid="pile-waste"]`, pulses: 3 };
    }
    return null;
  },
  component: Klondike,
};
