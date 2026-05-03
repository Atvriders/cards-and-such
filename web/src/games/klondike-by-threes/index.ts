import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KlondikeByThreesState, KlondikeByThreesAction } from "./state.js";
import { initialState, reducer, isTerminal, kbt3Ruleset} from "./state.js";
import { canMove } from "../../engines/tableau/moves.js";
const KlondikeByThrees = /* @__PURE__ */ lazy(() => import("./KlondikeByThrees.js").then((mod) => ({ default: mod.KlondikeByThrees as unknown as React.ComponentType<unknown> })));
export const kbt3Settings = {
  redeals: {
    kind: "enum" as const,
    label: "Redeals",
    options: ["unlimited", "3"] as const,
    default: "unlimited" as const,
  },
} as const;

type KBT3Settings = SettingsOf<typeof kbt3Settings>;

export const klondikeByThreesPlugin: GamePlugin<KlondikeByThreesState, KlondikeByThreesAction, typeof kbt3Settings> = {
  id: "klondike-by-threes",
  title: "Klondike by Threes",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Klondike with draw-3 stock — only the top of the three is playable.",
  howToPlay: `Klondike by Threes is the draw-three variant of Klondike — widely considered the "standard" casino version and significantly harder than draw-one.

Setup: Identical to Klondike — seven tableau columns with 1–7 cards each (only the top card face-up), a stock, waste, and four foundations.

Goal: Move all 52 cards to the four foundations, building each from Ace up to King in the same suit.

Draw rule: Click the stock to flip three cards to the waste at once. Only the topmost of the three is playable. To reach buried cards, you must play or move the cards above them first by cycling through the waste.

Tableau rules: Build columns down in alternating colors (red on black). Move single cards or valid alternating-color sequences. Empty columns accept only Kings.

Redeals: You may choose unlimited redeals (cycle through the waste as many times as needed) or limit yourself to exactly 3 redeals for a tougher challenge.

Tips: Draw-three dramatically limits card access compared to draw-one. Think ahead about the order cards will appear in the waste. Plan to clear columns to empty so Kings can anchor new sequences. The limited redeal option adds significant extra pressure — count your remaining redeals carefully.`,
  settings: kbt3Settings,
  initialState: (seed: number, settings: KBT3Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: KlondikeByThreesState): HintTarget | null => {
    const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
    const sources = ["waste", "t1", "t2", "t3", "t4", "t5", "t6", "t7"];
    for (const sourceId of sources) {
      const src = state.piles.find((p) => p.id === sourceId);
      if (!src || src.cards.length === 0) continue;
      for (const foundId of FOUNDATION_IDS) {
        if (canMove(state.piles, { fromPile: sourceId, toPile: foundId, count: 1 }, kbt3Ruleset)) {
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
  component: KlondikeByThrees,
};
