import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SetbackState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Setback = /* @__PURE__ */ lazy(() => import("./Setback.js").then((mod) => ({ default: mod.Setback as unknown as React.ComponentType<unknown> })));
import type { Suit } from "../../engines/deck/index.js";

export const setbackSettings = {} as const;
type SetbackSettings = SettingsOf<typeof setbackSettings>;

type SetbackAction =
  | { type: "bid"; amount: number }
  | { type: "name-trump"; suit: Suit }
  | { type: "play"; cardId: string };

export const setbackPlugin: GamePlugin<SetbackState, SetbackAction, typeof setbackSettings> = {
  id: "setback",
  title: "Setback (Pitch)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "4-player bidding trick-taker. Bid how many points you'll capture, name trump, and score High/Low/Jack/Game.",
  howToPlay: `Setback (also called Pitch or Auction Pitch) is a 4-player trick-taking card game with bidding, played with a standard 52-card deck.

Setup: Six cards are dealt to each player. Players bid on how many points they will capture.

Bidding: Bid 2, 3, or 4 points — or pass (0). The highest bidder names the trump suit. If you win the bid, you MUST score at least that many points or you lose those points instead.

Four points are available each hand:
- High: Awarded to whoever captures the highest trump card played.
- Low: Awarded to whoever captures the lowest trump card played.
- Jack: Awarded to whoever captures the Jack of trump (if it appears in tricks played).
- Game: Awarded to whoever captures the most counter-point value: 10=10, Ace=4, King=3, Queen=2, Jack=1.

Playing tricks: The high bidder leads first. You must follow the led suit if possible (and may also play trump). The highest trump wins; otherwise the highest card of the led suit wins.

Scoring: The bidder scores their points earned; if short of their bid, they score negative bid. Other players score whatever points they captured.

Strategy: Bid conservatively unless you hold strong trump cards. The "Game" point often goes to whoever captures the 10 of trump.`,
  settings: setbackSettings,
  initialState: (seed: number, _settings: SetbackSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: SetbackState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-setback-primary"]', pulses: 3 };
  },
  component: Setback,
};
