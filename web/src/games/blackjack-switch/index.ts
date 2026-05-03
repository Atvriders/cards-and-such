import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchState, BlackjackSwitchAction } from "./state.js";
import { initialState, reducer, isTerminal, handValue } from "./state.js";
const BlackjackSwitchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BlackjackSwitchGame as unknown as React.ComponentType<unknown> })));
export const blackjackSwitchSettings = {
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
    label: "Bet per Hand (×2)",
    options: ["5", "10", "25", "100"] as const,
    default: "10",
  },
  deckCount: {
    kind: "enum" as const,
    label: "Number of Decks",
    options: ["6", "8"] as const,
    default: "6",
  },
} as const;

type Settings = SettingsOf<typeof blackjackSwitchSettings>;

export const blackjackSwitchPlugin: GamePlugin<BlackjackSwitchState, BlackjackSwitchAction, typeof blackjackSwitchSettings> = {
  id: "blackjack-switch",
  title: "Blackjack Switch",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two hands dealt simultaneously. You may swap the top cards between hands. Dealer pushes on 22.",
  howToPlay: `Blackjack Switch is a casino twist on classic Blackjack where you play two hands at once and may swap the second card between them before playing.

Setup: Each round costs two bets. Four cards are dealt — two to each of your hands. After viewing all four, you choose: Switch (swap the top card of hand 1 with the top card of hand 2) or No Switch (keep hands as dealt). Switching lets you combine cards strategically to make stronger hands.

Play: After the switch decision, play each hand in turn — Hit, Stand, or Double Down (on the first two cards). Standard Blackjack rules apply.

Dealer rules: The dealer draws to 17. The key twist: if the dealer reaches exactly 22, it is NOT a bust — instead it is a push against all surviving player hands. This compensates for the powerful switch ability.

Scoring: Winning hands pay 1:1. Blackjack pays even money (not 3:2) as part of the balancing rules. Dealer 22 pushes against any non-busted hand regardless of the player's total.

Strategy tip: Prioritise building one very strong hand when switching — a 20 or blackjack — rather than improving both moderately. Avoid switching when both hands are already good (17+).`,
  settings: blackjackSwitchSettings,
  initialState: (seed: number, settings: Settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if (state.phase === "betting" || state.phase === "settled") {
      return { selector: '[data-testid="hint-target-blackjack-switch-deal"]', pulses: 3 };
    }
    if (state.phase !== "player") return null;
    const hand = state.activeHandIndex === 0 ? state.hand1 : state.hand2;
    const total = handValue(hand.cards).best;
    if (total < 12) return { selector: '[data-testid="hint-target-blackjack-switch-hit"]', pulses: 3 };
    if (total >= 17) return { selector: '[data-testid="hint-target-blackjack-switch-stand"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-blackjack-switch-hit"]', pulses: 3 };
  },
  component: BlackjackSwitchGame,
};
