import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { AcesUpState, AcesUpAction } from "./state.js";
import { initialState, reducer, isTerminal, findDiscardable } from "./state.js";
const AcesUp = /* @__PURE__ */ lazy(() => import("./AcesUp.js").then((mod) => ({ default: mod.AcesUp as unknown as React.ComponentType<unknown> })));
export const acesUpSettings = {} as const;

export const acesUpPlugin: GamePlugin<AcesUpState, AcesUpAction, typeof acesUpSettings> = {
  id: "aces-up",
  title: "Aces Up",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove low cards when two tops share a suit. Deal 4 at a time. Aces survive.",
  howToPlay: `Aces Up (also called Idiot's Delight) uses a single deck with four tableau columns. Deal 4 cards to start, one per column.

Dealing: Click "Deal 4" to deal four more cards, one onto each column. Repeat until the stock is exhausted. There are 13 deals total (including the initial deal).

Discarding: After each deal (and any time you choose), look at the four column tops. If two or more share a suit, remove all but the highest-ranked one of that suit. Aces are high — they cannot be removed. Click "Discard Lowers" to remove all eligible low cards at once.

Moving: You may move the top card of any column onto any empty column. This is the key strategic tool: by repositioning cards, you expose lower cards in the same suit that can then be removed.

Winning: Discard all 48 non-Ace cards, leaving exactly one Ace on top of each column. This requires careful use of empty columns to expose and remove the right cards.

Strategy: Prioritize emptying columns to gain mobility. When a column is empty, use it to reveal buried low cards. Avoid burying Aces deep in columns. Think ahead about which cards in the same suit block each other.`,
  settings: acesUpSettings,
  initialState: (seed) => initialState(seed, {}),
  hint: (state: AcesUpState): HintTarget | null => {
    if (state.won) return null;
    const discardable = findDiscardable(state.columns);
    if (discardable.length > 0) {
      return { selector: '[data-testid="hint-target-aces-up-discard"]', pulses: 3 };
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-aces-up-deal"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: AcesUp,
};
