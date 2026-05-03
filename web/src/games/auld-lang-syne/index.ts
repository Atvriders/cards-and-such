import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AuldLangSyneState, AuldLangSyneAction, AuldLangSyneSettings } from "./state.js";
const AuldLangSyne = /* @__PURE__ */ lazy(() => import("./AuldLangSyne.js").then((mod) => ({ default: mod.AuldLangSyne as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const auldLangSynePlugin: GamePlugin<AuldLangSyneState, AuldLangSyneAction, typeof settings> = {
  id: "auld-lang-syne",
  title: "Auld Lang Syne",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A luck-driven solitaire with pre-placed Aces and one-way traffic to foundations.",
  howToPlay: `Auld Lang Syne is a luck-heavy solitaire named for the Scottish song. The four Aces are extracted from the deck and placed on the four foundations before play begins.

Setup: Four tableau piles each receive one face-up card from the shuffled remaining 47 cards. The rest form the stock.

Goal: Build each foundation up from Ace to King, one suit per foundation, moving cards in sequence (A, 2, 3, … K).

Each turn you have three options for each tableau card: send it directly to its matching foundation (if the rank is the next needed), discard it face-up to the waste pile, or draw the next stock card to refill an empty tableau slot.

When all four tableau slots are filled and you want to advance, draw from the stock — this deals one new card to each empty tableau slot, or if all are full, places the drawn card onto the waste.

Waste cards cannot be replayed — once discarded, they are gone. Strategy is limited, as the order of the shuffle largely determines success. Focus on sending every legally playable card to the foundation immediately rather than discarding it.

Win by moving all 52 cards to the four foundations. Fewer moves means a higher score.`,
  settings,
  initialState: (seed: number, _settings: AuldLangSyneSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: AuldLangSyne,
};
