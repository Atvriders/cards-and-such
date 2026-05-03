import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type CardLineupState, type CardLineupAction } from "./state.js";
const CardLineup = /* @__PURE__ */ lazy(() => import("./CardLineup.js").then((mod) => ({ default: mod.CardLineup as unknown as React.ComponentType<unknown> })));
export const cardLineupSettings = {} as const;

export const cardLineupPlugin: GamePlugin<CardLineupState, CardLineupAction, typeof cardLineupSettings> = {
  id: "card-lineup",
  title: "Card Lineup",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rearrange 9 cards by rank using swaps. Fewer moves = higher score!",
  howToPlay: `Card Lineup is a sorting puzzle. Nine cards are dealt face-up in a row in a random order. Your goal is to rearrange them from lowest to highest rank (2, 3, 4 … 10, J, Q, K, A) using as few swaps as possible.

To move cards: click a card to select it (it will highlight with a gold border), then click another card to swap their positions. The two cards instantly exchange places and the move counter increments by one.

Ties in rank are broken by suit order: ♠ < ♥ < ♦ < ♣. So if two cards share the same rank, the ♠ version comes before the ♣ version in the correct sequence.

The puzzle is solved the moment the cards are in fully sorted order — left to right, lowest to highest. You receive a score of max(0, 200 − moves × 10). Solving in 20 or fewer moves earns the maximum 200 points. Each move beyond that costs 10 points.

Nine cards can always be sorted in at most 8 swaps (selection sort), so a determined solver can always score at least 120. But finding the minimum number of swaps requires thinking ahead — identify cycles in the permutation to plan the most efficient route.

Tip: before clicking, figure out which card belongs in position 1, then where the displaced card should go, and so on. Chaining placements in a cycle is more efficient than random swapping.`,
  settings: cardLineupSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: CardLineup,
};
