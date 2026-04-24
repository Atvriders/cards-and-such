import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FanTanState, FanTanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FanTan } from "./Game.js";

export const fanTanSettings = {
  roundsPerSession: {
    kind: "number" as const,
    label: "Rounds per Session",
    min: 5, max: 50, step: 5, default: 15,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Number",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type FanTanSettingsType = SettingsOf<typeof fanTanSettings>;

export const fanTanPlugin: GamePlugin<FanTanState, FanTanAction, typeof fanTanSettings> = {
  id: "fan-tan",
  title: "Fan Tan",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Chinese betting game. Guess the remainder (1-4) after dividing beans by 4.",
  howToPlay: `Fan Tan is one of the oldest casino games, originating in China. A dealer scoops a random pile of small objects (beans) from a bowl, then removes them four at a time. The number remaining after all groups of four are removed — 1, 2, 3, or 4 — determines the winner.

Betting: Click one or two numbers (1–4) to place your bet chips on them. The Reveal button shows the bean count and calculates the remainder.

Payouts: Straight bet (one number) pays 3:1 — you risk 1, win 3. Split bet (two numbers) pays 1:1 on whichever hits — if your number wins you collect 1x your bet on it, but lose the other bet (so net effect: even on a hit, lose one bet on a miss).

House edge: With four equal outcomes (25% each), the 3:1 payout on a straight creates a 25% expected loss each time. Splitting to two numbers adds diversification but does not improve the house edge — it remains 25%.

Strategy: There is no skill in outcome prediction. Manage your bankroll by making smaller bets and limiting rounds. The fun is the suspense of the bean reveal.

Score equals final bankroll at session end.`,
  settings: fanTanSettings,
  initialState: (seed: number, settings: FanTanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FanTan,
};
