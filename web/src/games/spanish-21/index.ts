import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Spanish21State, Spanish21Action } from "./state.js";
import { initialState, reducer, isTerminal, handValue } from "./state.js";
const Spanish21Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Spanish21Game as unknown as React.ComponentType<unknown> })));
export const spanish21Settings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25", "100"] as const,
    default: "10",
  },
} as const;

type Settings = SettingsOf<typeof spanish21Settings>;

export const spanish21Plugin: GamePlugin<Spanish21State, Spanish21Action, typeof spanish21Settings> = {
  id: "spanish-21",
  title: "Spanish 21",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Blackjack played with a 48-card Spanish deck (10s removed). Player-friendly rules and bonus payouts.",
  howToPlay: `Spanish 21 is a Blackjack variant played with a Spanish deck — all four 10 pip cards are removed, leaving 48 cards per deck. This lowers the house edge on naturals while introducing player-friendly rules and bonus payouts to compensate.

Key differences from Blackjack: Player 21 always beats dealer 21 — no push when you have 21, even against a dealer blackjack. You can Double Down after any number of cards (not just the first two). Late Surrender is available on your first two cards, recovering half your bet.

Bonus payouts for a 21 with multiple cards: A 5-card 21 pays 2:1; 6-card 21 pays 3:1; 7+ card 21 pays 4:1. Special 3-card combos of 6-7-8 or 7-7-7 pay 2:1 (3:1 if suited). These bonuses reward aggressive hitting.

Dealer rules: Dealer hits soft 17 in Spanish 21.

Strategy tip: Hit more freely than in standard Blackjack — the bonus payouts reward reaching 21 with many cards. The absence of 10s means your bust risk on hitting a stiff hand is slightly lower than standard Blackjack, so hit those 12s and 13s more liberally. Always surrender 15 or 16 against a dealer 10 or Ace upcard.`,
  settings: spanish21Settings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (state.phase === "betting" || state.phase === "settled") {
      return { selector: '[data-testid="hint-target-spanish-21-deal"]', pulses: 3 };
    }
    if (state.phase !== "player") return null;
    const total = handValue(state.playerHand.cards).best;
    if (total < 12) return { selector: '[data-testid="hint-target-spanish-21-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-spanish-21-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-spanish-21-hit"]', pulses: 3 };
  },
  component: Spanish21Game,
};
