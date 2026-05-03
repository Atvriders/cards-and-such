import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LetItRideState, LetItRideAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LetItRide = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LetItRide as unknown as React.ComponentType<unknown> })));
export const letItRideSettings = {
  startingBankroll: {
    kind: "number" as const,
    label: "Starting Bankroll",
    min: 100,
    max: 5000,
    step: 100,
    default: 1000,
  },
  anteSize: {
    kind: "enum" as const,
    label: "Ante Size (×3 total)",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
  handsPerSession: {
    kind: "number" as const,
    label: "Hands per Session",
    min: 5,
    max: 50,
    step: 5,
    default: 20,
  },
} as const;

type LetItRideSettingsType = SettingsOf<typeof letItRideSettings>;

export const letItRidePlugin: GamePlugin<LetItRideState, LetItRideAction, typeof letItRideSettings> = {
  id: "let-it-ride",
  title: "Let It Ride",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 3 equal bets, then decide to pull back bets as community cards are revealed. Big pairs pay!",
  howToPlay: `Let It Ride is a casino poker game where you control how much you wager based on how good your cards are.

Each round you place three equal bets (e.g., 3 × $10 = $30). You receive 3 cards face-up, while 2 community cards stay hidden. After seeing your 3 cards, you may pull back your first bet — or "let it ride."

The first community card is then revealed. Again you may pull back your second bet, or let it ride. Your third bet always stays. Finally, the second community card reveals to form a 5-card hand.

Your final hand is ranked against the paytable. Each bet that you left in play is paid independently:
• Royal Flush: 1000:1  • Straight Flush: 200:1
• Four of a Kind: 50:1  • Full House: 11:1
• Flush: 8:1  • Straight: 5:1
• Three of a Kind: 3:1  • Two Pair: 2:1
• Pair of Tens or Better: 1:1

If your hand doesn't qualify (below a pair of tens), all remaining bets lose. Bets you pulled back are already returned.

Strategy tip: Let it ride with a paying hand (pair of 10s or better in your 3 cards), a made straight or flush draw with 3 cards. Pull back otherwise to limit losses.

Settings: Choose starting bankroll, ante size, and hands per session.`,
  settings: letItRideSettings,
  initialState: (seed: number, settings: LetItRideSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: LetItRideState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-let-it-ride-primary"]', pulses: 3 };
  },
  component: LetItRide,
};
