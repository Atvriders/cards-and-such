import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SultanState, SultanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SultanOfTurkey = /* @__PURE__ */ lazy(() => import("./SultanOfTurkey.js").then((mod) => ({ default: mod.SultanOfTurkey as unknown as React.ComponentType<unknown> })));
export const sultanSettings = {} as const;

type SultanSettings = SettingsOf<typeof sultanSettings>;

export const sultanPlugin: GamePlugin<SultanState, SultanAction, typeof sultanSettings> = {
  id: "sultan-of-turkey",
  title: "Sultan of Turkey",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A King-centered solitaire. Build three suit foundations from King upward (wrapping Ace) while the Sultan King of Hearts sits immovable at the center.",
  howToPlay: `Sultan of Turkey is a stock-based solitaire where the four Kings are placed on foundations at the start, and you build each one up through the suit in a wrap-around sequence.

Setup: All four Kings are automatically moved to the foundations. The King of Hearts is the Sultan — it sits fixed and already counts as a completed foundation entry. The other three Kings (Spades, Diamonds, Clubs) each anchor their own foundation. Four reserve slots hold one card each and are pre-filled with four cards from the remaining deck.

Goal: Build all four non-Sultan foundations completely through their suit: King → Ace → 2 → 3 → … → Queen (12 cards placed on top of the King). The Sultan foundation is already in place, so you must complete the other three suits.

Play: Click the stock to flip one card to the waste pile. Click the waste card to automatically send it to a foundation if it fits, or to park it in an empty reserve slot. Click a reserve card to send it to a foundation if legal. The waste can be redealt from the beginning once exhausted.

Scoring: +10 for each card moved to a foundation.

Tips: Reserve slots are scarce — use them to hold cards that will soon become playable. Build foundations evenly to avoid blocking one suit with another.`,
  settings: sultanSettings,
  initialState: (seed: number, settings: SultanSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SultanOfTurkey,
};
