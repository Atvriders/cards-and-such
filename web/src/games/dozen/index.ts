import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DozenState, DozenAction, DozenSettings } from "./state.js";
const Dozen = /* @__PURE__ */ lazy(() => import("./Dozen.js").then((mod) => ({ default: mod.Dozen as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const dozenPlugin: GamePlugin<DozenState, DozenAction, typeof settings> = {
  id: "dozen",
  title: "Dozen",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove pairs of same-rank cards and build foundations A–Q on 12 columns (no Kings).",
  howToPlay: `Dozen is a solitaire that plays with a King-free deck. All four Kings are removed before play, leaving 48 cards.

Setup: The 48 cards are dealt into 12 face-up columns of 4 cards each. The four Aces are automatically moved to the foundations when dealt.

Goal: Win by sending all 48 remaining cards either to the four foundations or by pairing them off.

Two types of moves are available:

Pair removal: click any top card of a column to select it, then click another top card of the same rank to remove both from the game. This is your primary way to clear the columns.

Foundation build: each foundation holds one suit, built up from Ace to Queen (A 2 3 4 5 6 7 8 9 10 J Q). When a column's top card is the next needed card for its suit's foundation, click the foundation button (→F) to send it there.

Note that Kings never appear — each foundation stops at Queen. Strategy involves balancing pair removal against foundation sequencing; sometimes it is better to sit on a card in hopes of a matching partner appearing than to rush it to the foundation.

The game ends when all cards are cleared (win) or no valid pair or foundation move exists (loss).`,
  settings,
  initialState: (seed: number, _settings: DozenSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Dozen,
};
