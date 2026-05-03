import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CornersSolitaireState, CornersSolitaireAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CornersSolitaire = /* @__PURE__ */ lazy(() => import("./CornersSolitaire.js").then((mod) => ({ default: mod.CornersSolitaire as unknown as React.ComponentType<unknown> })));
export const cornersSolitaireSettings = {} as const;

export const cornersSolitairePlugin: GamePlugin<CornersSolitaireState, CornersSolitaireAction, typeof cornersSolitaireSettings> = {
  id: "corners-solitaire",
  title: "Corners",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deal to four corner piles while building foundations Ace to King by suit.",
  howToPlay: `Corners is a relaxed draw-and-sort solitaire played with a single standard deck.

Layout: Four corner tableau piles each receive 3 cards at the start. The stock sits in the center with a waste pile beside it. The four foundation piles are also in the center, built from Ace to King in suit.

Goal: Move all 52 cards to the foundations, one pile per suit, ascending from Ace.

Moves: Draw one card at a time from the stock onto the waste. The waste top card and the top card of any corner pile may be played onto a foundation if it continues the suit sequence. Cards from the waste or any corner pile top may also be moved to any corner pile, stacking freely in any order. Only single cards move at a time.

Once the stock is empty, the waste may be recycled unlimited times.

Strategy: Don't clutter the corner piles with high cards early. Keep aces and twos accessible. Move intermediate cards to corners strategically so you can uncover the next card you need for a foundation run.

Win condition: All 52 cards on the four foundations.`,
  settings: cornersSolitaireSettings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: CornersSolitaire,
};
