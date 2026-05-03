import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PrecedenceState, PrecedenceAction } from "./state.js";
const PrecedenceGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PrecedenceGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const precedencePlugin: GamePlugin<PrecedenceState, PrecedenceAction, typeof settings> = {
  id: "precedence",
  title: "Precedence",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A stock-and-reserve solitaire building foundations downward from King to Ace by suit.",
  howToPlay: `Precedence is a demanding stock-and-reserve solitaire that requires careful planning of an eight-cell buffer. Unlike most solitaires, foundations here build downward — from King to Ace — one suit per pile.

Setup: All 52 cards go into the stock. Four foundation piles start empty; eight reserve cells start empty.

Goal: Build four foundation piles, one per suit, from King down to Ace in sequence.

Play: Draw one card at a time from the stock onto the waste pile. The top of the waste can be sent to a matching foundation (if it is the next rank needed) or parked in an empty reserve cell. Likewise, any reserve card that fits a foundation may be moved there at any time. When the stock empties, flip the waste to redeal — unlimited redeals are allowed.

Strategy: The eight reserve cells are your primary tool. Park cards you'll need soon but can't yet play. Be cautious of filling all cells before Kings appear — without Kings to start foundations, a full reserve can become an impossible bottleneck. Prioritize uncovering Kings early.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: PrecedenceGame,
};
