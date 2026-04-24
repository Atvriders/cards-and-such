import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighLowState, HighLowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HighLowCasino } from "./Game.js";

export const highLowSettings = {
  handsPerSession: {
    kind: "number" as const,
    label: "Rounds per Session",
    min: 5, max: 100, step: 5, default: 20,
  },
  bet: {
    kind: "enum" as const,
    label: "Bet per Round",
    options: ["5", "10", "25"] as const,
    default: "10",
  },
} as const;

type HighLowSettingsType = SettingsOf<typeof highLowSettings>;

export const highLowCasinoPlugin: GamePlugin<HighLowState, HighLowAction, typeof highLowSettings> = {
  id: "high-low-casino",
  title: "High-Low Casino",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict higher, lower, or same. Build streaks for multiplied payouts.",
  howToPlay: `High-Low Casino is a simple yet thrilling guessing game. A card is revealed and you predict whether the next card will be Higher, Lower, or the Same rank.

Gameplay: Press Deal to pay your bet and reveal the base card. Predict whether the next card drawn will be higher, lower, or the same rank (Ace = high = 14).

Streak system: Each correct consecutive guess builds your streak and multiplies your payout: 1 correct = 1x, 2 in a row = 2x, 3 in a row = 4x, 4+ = 8x. A wrong guess ends the round and you lose your bet.

Banking: Once you have a streak going, use the Bank button to collect your multiplied winnings and safely end the round. Greedy play risks losing everything!

Same bet: Predicting "Same" is a bold bet with true 4:1 odds on a standard deck (4 of each rank in 52 cards). Getting it right counts toward your streak.

Strategy: Bank early on uncertain cards. Guess Higher when the base card is low, Lower when it's high. Ace-high makes "Same" least likely but pays as part of a streak.

Your score equals your final bankroll.`,
  settings: highLowSettings,
  initialState: (seed: number, settings: HighLowSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: HighLowCasino,
};
