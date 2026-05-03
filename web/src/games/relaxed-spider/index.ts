import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RelaxedSpiderState, RelaxedSpiderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RelaxedSpider = /* @__PURE__ */ lazy(() => import("./RelaxedSpider.js").then((mod) => ({ default: mod.RelaxedSpider as unknown as React.ComponentType<unknown> })));
export const relaxedSpiderSettings = {
  suits: {
    kind: "enum" as const,
    label: "Suits",
    options: ["1", "2", "4"] as const,
    default: "1" as const,
  },
} as const;

type RSSettings = SettingsOf<typeof relaxedSpiderSettings>;

export const relaxedSpiderPlugin: GamePlugin<RelaxedSpiderState, RelaxedSpiderAction, typeof relaxedSpiderSettings> = {
  id: "relaxed-spider",
  title: "Relaxed Spider",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spider with a relaxed removal rule — any K-to-A descending sequence auto-removes, regardless of suit.",
  howToPlay: `Relaxed Spider plays identically to standard Spider with one key rule change that makes it significantly more approachable.

Setup: Ten tableau columns — the first four hold 6 cards each, the remaining six hold 5 cards each (54 total). Only the top card of each column is face-up. The remaining 50 cards form the stock. You can play with 1, 2, or 4 suits.

Goal: Form eight complete K-to-A descending sequences on the tableau. Each completed sequence is automatically removed.

Difference from standard Spider: In standard Spider, the auto-removed sequence must be the same suit throughout. In Relaxed Spider, any 13-card K-to-A descending sequence is automatically removed regardless of suit. This means you can build sequences across suits and still complete them.

Tableau movement: Place a card on any tableau top that is exactly one rank higher. You may pick up and move any descending sequence (no suit restriction on the sequence you pick up).

Stock: Click the stock to deal one card face-up to each of the ten columns simultaneously. You cannot deal if any column is empty.

Tips: The relaxed removal rule allows sequences of mixed suits to count. Take advantage of this — you no longer need to keep suits perfectly aligned to complete a sequence. Focus on uncovering face-down cards as quickly as possible.`,
  settings: relaxedSpiderSettings,
  initialState: (seed: number, settings: RSSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: RelaxedSpiderState): HintTarget | null => {
    // Priority 1: any tableau column whose top two face-up cards form a same-suit descending run.
    const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"];
    for (const id of TABLEAU_IDS) {
      const pile = state.piles.find((p) => p.id === id);
      if (!pile || pile.cards.length < 2) continue;
      const faceUp = pile.faceUpCount ?? 0;
      if (faceUp < 2) continue;
      const top = pile.cards[pile.cards.length - 1]!;
      const below = pile.cards[pile.cards.length - 2]!;
      if (top.suit === below.suit && (below.rank as number) === (top.rank as number) + 1) {
        return { selector: `[data-testid="pile-${id}"]`, pulses: 3 };
      }
    }
    // Priority 2: deal another row if all columns have cards and stock has >= 10.
    const stock = state.piles.find((p) => p.id === "stock");
    const allFilled = TABLEAU_IDS.every((id) => {
      const p = state.piles.find((pp) => pp.id === id);
      return p && p.cards.length > 0;
    });
    if (stock && stock.cards.length >= 10 && allFilled) {
      return { selector: `[data-testid="pile-stock"]`, pulses: 3 };
    }
    return null;
  },
  component: RelaxedSpider,
};
