import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type CoinFlipState, type CoinFlipAction } from "./state.js";
import { CoinFlipStreak } from "./CoinFlipStreak.js";

export const coinFlipSettings = {
  maxFlips: { kind: "enum" as const, label: "Streak Goal", options: ["5", "10", "20"] as const, default: "5" as const },
} as const;

export const coinFlipStreakPlugin: GamePlugin<CoinFlipState, CoinFlipAction, typeof coinFlipSettings> = {
  id: "coin-flip-streak",
  title: "Coin Flip Streak",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Predict heads or tails. Keep going while you're right. How long can your streak last?",
  howToPlay: `Coin Flip Streak is a simple prediction game. Before each flip you must predict whether the coin will land heads or tails. Click Heads or Tails to make your prediction, then click Flip to see the result.

If you're correct, your streak grows by one and you continue to the next flip. Get it wrong and your streak resets — game over!

Your goal is to reach the streak goal set in the settings (5, 10, or 20 consecutive correct predictions). Reach the goal and you win! Fall short and the game records your best streak.

The coin is fair — exactly 50/50 each flip, seeded by the game's random number generator so results are reproducible but unpredictable. No strategy can improve your odds; this is pure luck.

Scoring: your best streak × 100 points. A perfect run (winning streak) scores streak goal × 100. Even partial streaks score something, so it's always worth going again.

Tips: there are no tips for a 50/50 coin. But some players swear by always picking the same side, or alternating. Does it help? Nope. Enjoy the tension!`,
  settings: coinFlipSettings,
  initialState,
  reducer,
  isTerminal,
  component: CoinFlipStreak,
};
