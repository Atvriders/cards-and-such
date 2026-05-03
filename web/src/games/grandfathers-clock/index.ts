import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrandfathersClockState, GrandfathersClockAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GrandFathersClock = /* @__PURE__ */ lazy(() => import("./GrandFathersClock.js").then((mod) => ({ default: mod.GrandFathersClock as unknown as React.ComponentType<unknown> })));
export const grandfathersClockSettings = {} as const;

type GrandfathersClockSettings = SettingsOf<typeof grandfathersClockSettings>;

export const grandfathersClockPlugin: GamePlugin<GrandfathersClockState, GrandfathersClockAction, typeof grandfathersClockSettings> = {
  id: "grandfathers-clock",
  title: "Grandfather's Clock",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "12 clock-face foundations each starting with a preset card. Build each foundation up in suit (wrapping) while managing 8 tableau columns.",
  howToPlay: `Grandfather's Clock arranges twelve foundations in a clock face, each pre-loaded with a specific card that represents its hour position: the 2 o'clock foundation starts with a 2 (Hearts), 3 o'clock with a 3 (Clubs), and so on up to the 12 o'clock position which starts with a King (Spades).

Objective: Build every clock foundation completely through its suit, wrapping from King to Ace and continuing up to fill all 13 cards. All 52 cards must end up on the foundations to win.

Setup: The 12 clock cards are placed automatically. The remaining 40 cards are shuffled and dealt face-up to 8 tableau columns of 5 cards each.

Tableau rules: You may move only the top card of any tableau column. A card may be placed on any tableau column whose top card is exactly one rank higher, regardless of suit. Any card may be placed on an empty tableau column.

Foundation rules: Each clock foundation builds up in the same suit in a wrapping sequence (e.g., 9→10→J→Q→K→A→2→…). Only the top card of any tableau pile can be moved to a foundation.

Scoring: +10 for each card moved to a clock foundation. Use Auto-move to send all immediately playable cards to their foundations.

Tips: Plan around the wrapping — a foundation near its target rank may block the last few cards of a suit. Keep tableau columns open to maneuver.`,
  settings: grandfathersClockSettings,
  initialState: (seed: number, settings: GrandfathersClockSettings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: GrandfathersClockState): HintTarget | null => {
    if (state.won) return null;
    return { selector: '[data-testid="hint-target-grandfathers-clock-auto"]', pulses: 3 };
  },
  component: GrandFathersClock,
};
