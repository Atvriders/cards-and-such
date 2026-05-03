import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { InterregnumState, InterregnumAction, InterregnumSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Interregnum = /* @__PURE__ */ lazy(() => import("./Interregnum.js").then((mod) => ({ default: mod.Interregnum as unknown as React.ComponentType<unknown> })));
export const interregnumSettings = {} as const;

export const interregnumPlugin: GamePlugin<InterregnumState, InterregnumAction, typeof interregnumSettings> = {
  id: "interregnum",
  title: "Interregnum",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire — eight foundations start on random ranks and build upward with circular wrapping.",
  howToPlay: `Interregnum is a two-deck (104-card) solitaire that takes its name from the period between two reigns — reflecting how its foundations start not at Ace but at a transitional rank determined by the deal.

Setup: eight foundation "starter" cards are automatically placed, two for each suit. The rank of the first card dealt for each suit determines the base for that suit's two foundations. For example, if an 8 of spades appears first, both spades foundations begin at 8 and build upward: 8→9→10→J→Q→K→A→2→3→4→5→6→7, wrapping around until all 13 cards are placed. The remaining 96 cards go to the stock.

Eight discard piles start empty and act as buffers. Draw one card at a time from the stock. Play the drawn card to a foundation if it is the next card in sequence, otherwise send it to any discard pile. The top card of each discard pile is always available.

You may also move the top card of one discard pile to another or directly to a foundation.

There is no recycling of the stock — each card may only be drawn once. This makes Interregnum a demanding game of forethought: choose which discard pile to use carefully, since a poorly managed pile can lock away critical cards.

Score: 5 points per card successfully placed on a foundation.`,
  settings: interregnumSettings,
  initialState: (seed: number) => initialState(seed, {} as InterregnumSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Interregnum,
};
