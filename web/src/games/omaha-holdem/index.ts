import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OmahaState, OmahaAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OmahaHoldem = /* @__PURE__ */ lazy(() => import("./OmahaHoldem.js").then((mod) => ({ default: mod.OmahaHoldem as unknown as React.ComponentType<unknown> })));
export const omahaSettings = {
  startingBankroll: {
    kind: "enum" as const,
    label: "Starting Bankroll",
    options: ["500", "1000", "5000"] as const,
    default: "1000",
  },
  blinds: {
    kind: "enum" as const,
    label: "Blind Levels",
    options: ["2/4", "5/10", "10/20"] as const,
    default: "5/10",
  },
} as const;

type OmahaSettingsType = SettingsOf<typeof omahaSettings>;

export const omahaHoldemPlugin: GamePlugin<OmahaState, OmahaAction, typeof omahaSettings> = {
  id: "omaha-holdem",
  title: "Omaha Hold'em",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up Omaha vs a bot. 4 hole cards — must use exactly 2 hole + 3 community.",
  howToPlay: `Omaha Hold'em plays like Texas Hold'em but with one crucial twist: you are dealt 4 hole cards instead of 2, and you MUST use exactly 2 of your hole cards combined with exactly 3 of the 5 community cards to form your best 5-card hand.

This rule dramatically changes strategy — you cannot play the board alone. Having four cards gives you more hand combinations, making strong hands more common. Expect more action and bigger swings than in Hold'em.

Each hand: blinds are posted, 4 hole cards are dealt face-down to each player. Then 5 community cards are revealed in three rounds: Flop (3), Turn (1), River (1), with a betting round after each.

Betting is fixed-limit. On each street: Check, Bet, Call, Raise, or Fold. Pre-flop/flop bets are 1× the big blind; turn/river are 2×.

The bot evaluates its best Omaha hand using the 2+3 rule and makes decisions based on hand strength and pot odds. The game ends when one player goes bust.

Hand rankings are standard poker: Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.

Settings: Starting Bankroll ($500/$1000/$5000), Blind Levels (2/4, 5/10, 10/20).`,
  settings: omahaSettings,
  initialState: (seed: number, settings: OmahaSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: OmahaState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-omaha-holdem-primary"]', pulses: 3 };
  },
  component: OmahaHoldem,
};
