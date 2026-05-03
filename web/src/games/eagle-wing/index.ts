import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { EagleWingState, EagleWingAction, EagleWingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EagleWing = /* @__PURE__ */ lazy(() => import("./EagleWing.js").then((mod) => ({ default: mod.EagleWing as unknown as React.ComponentType<unknown> })));
export const eagleWingSettings = {} as const;

export const eagleWingPlugin: GamePlugin<EagleWingState, EagleWingAction, typeof eagleWingSettings> = {
  id: "eagle-wing",
  title: "Eagle Wing",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build four foundations A to K while managing 13 tableau columns, a 13-card reserve, and a draw pile.",
  howToPlay: `Eagle Wing is a single-deck solitaire named for its wide 13-column tableau that fans out like wings. The layout consists of four foundations, thirteen tableau columns (each starting with one face-up card), a thirteen-card reserve pile, and a stock.

Goal: move all 52 cards to the four foundations, building each pile up from Ace to King in its own suit.

Play: click a card to select it, then click a foundation or tableau column to move it. Only the top card of each tableau column is available. You may move a top card to another tableau column if it is one rank lower than the column's top card (any suit). Top card of the reserve may also be played to a foundation or tableau column.

Draw from the stock to expose cards onto the waste; the top waste card is playable. When the stock runs out, you may recycle the waste up to three times.

One card moves at a time — there are no multi-card moves. Empty tableau columns may be filled from any available source.

Score: 10 points for each card placed on a foundation.

Tips: prioritize getting Aces out early. Use the reserve strategically — it provides 13 extra "free" cards that can fill gaps in your tableau. Save your recycles for when you are genuinely stuck.`,
  settings: eagleWingSettings,
  initialState: (seed: number) => initialState(seed, {} as EagleWingSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: EagleWing,
};
