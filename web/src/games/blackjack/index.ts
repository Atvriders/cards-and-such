import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackjackState, BlackjackAction } from "./state.js";
import { initialState, reducer, isTerminal, handValue } from "./state.js";
const Blackjack = /* @__PURE__ */ lazy(() => import("./Blackjack.js").then((mod) => ({ default: mod.Blackjack as unknown as React.ComponentType<unknown> })));
export const blackjackSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 100,
    step: 5,
    default: 25,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Hand",
    options: ["5", "10", "25", "100"] as const,
    default: "10",
  },
  deckCount: {
    kind: "enum" as const,
    label: "Number of Decks",
    options: ["1", "4", "6", "8"] as const,
    default: "6",
  },
  dealerHitsSoft17: {
    kind: "boolean" as const,
    label: "Dealer Hits Soft 17",
    default: false,
  },
} as const;

type BlackjackSettingsType = SettingsOf<typeof blackjackSettings>;

export const blackjackPlugin: GamePlugin<BlackjackState, BlackjackAction, typeof blackjackSettings> = {
  id: "blackjack",
  title: "Blackjack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Beat the dealer to 21. Blackjack pays 3:2. Hit, Stand, Double, or Split.",
  howToPlay: `Beat the dealer by getting a hand closer to 21 without going over (busting). Blackjack — an Ace plus a ten-value card — pays 3:2.

Card values: numbered cards at face value, face cards (J/Q/K) = 10, Ace = 1 or 11.

Actions: Hit to take another card. Stand to end your turn. Double Down to double your bet and take exactly one more card. Split when your first two cards match — they become two separate hands each with their own bet.

Dealer rules: The dealer reveals the hidden card after you stand. The dealer must hit on 16 or below and stand on 17 or above (toggle "Dealer Hits Soft 17" to change behavior on soft 17).

Settings: Choose the number of decks (1, 4, 6, or 8), your bet per hand (5/10/25/100 credits), and how many hands make a session. Your score equals your final chip total at session end.

Tips: Basic strategy says always split Aces and 8s, never split 10s or 5s. Double down on 11 when the dealer shows 2–10. Stand on hard 17+. Never take insurance — the house edge is too high.`,
  settings: blackjackSettings,
  initialState: (seed: number, settings: BlackjackSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BlackjackState): HintTarget | null => {
    if (state.phase === "betting" || state.phase === "settled") {
      return { selector: '[data-testid="hint-target-blackjack-deal"]', pulses: 3 };
    }
    if (state.phase !== "player") return null;
    const hand = state.playerHands[state.activeHandIndex];
    if (!hand) return null;
    const total = handValue(hand.cards).best;
    if (total < 12) return { selector: '[data-testid="hint-target-blackjack-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-blackjack-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-blackjack-hit"]', pulses: 3 };
  },
  component: Blackjack,
};
