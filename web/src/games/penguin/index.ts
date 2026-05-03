import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PenguinState, PenguinAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Penguin = /* @__PURE__ */ lazy(() => import("./Penguin.js").then((mod) => ({ default: mod.Penguin as unknown as React.ComponentType<unknown> })));
export const penguinSettings = {} as const;

export const penguinPlugin: GamePlugin<PenguinState, PenguinAction, typeof penguinSettings> = {
  id: "penguin",
  title: "Penguin",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Seven-column tableau with wrapping foundations. Use free cells to unpack tricky stacks.",
  howToPlay: `Penguin deals 52 cards into seven columns. The top-left card determines the foundation starting rank — the other three cards of the same rank are immediately placed on the remaining three foundations. The other 48 cards fill the seven columns face-up (six columns of seven, one column of six).

Foundations: Build up by suit from the starting rank, wrapping from King back to Ace when needed. All four foundations build the same rank sequence, just in different suits.

Tableau: Build down by same suit, also wrapping (Ace sits below 2, which is below 3…). Only face-up cards are accessible. Empty columns accept any card or valid sequence.

Free cells: Seven free cells, each holding one card temporarily. Use them to maneuver blocked cards.

Multi-card moves: You can move a sequence of cards at once if they are same-suit and descending. The limit is (1 + empty free cells) × 2^(empty columns).

Strategy: Keep free cells available — you have seven, but they fill quickly. Prioritize building same-suit runs in the tableau to unlock longer sequences. Watch the wrapping carefully around the foundation starting rank.`,
  settings: penguinSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Penguin,
};
