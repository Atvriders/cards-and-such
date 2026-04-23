import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HighCardDrawState, type HighCardDrawAction } from "./state.js";
import { HighCardDraw } from "./HighCardDraw.js";

export const highCardDrawSettings = {
  roundsToWin: {
    kind: "enum" as const,
    label: "Rounds to Win",
    options: ["3", "5", "10"] as const,
    default: "5" as const,
  },
} as const;

export const highCardDrawPlugin: GamePlugin<HighCardDrawState, HighCardDrawAction, typeof highCardDrawSettings> = {
  id: "high-card-draw",
  title: "High Card Draw",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw cards against the bot. Highest card wins the round. First to N wins!",
  howToPlay: `High Card Draw is a simple head-to-head card game against the bot. A standard 52-card deck is shuffled at the start of each game.

Each round, click Draw Cards. You and the bot each receive one card face-up from the top of the deck. Compare ranks: the higher card wins the round. Aces are high (rank 14), then Kings, Queens, Jacks, then numbered cards in normal order.

If both cards share the same rank it is a tie — neither player scores a point for that round.

The first player to reach the target number of wins (3, 5, or 10 depending on settings) wins the match! If the deck runs out of cards before anyone reaches the target, the player with more wins claims victory.

Scoring: winning the match awards 100 points per round won. Losing the match awards 20 points per round won as a consolation.

There is no strategy — draws are random and the outcome is entirely luck. The fun is in the tension of flipping cards and watching the win counters climb. Try the 10-round mode for a longer, more dramatic match.

Tip: ties are relatively rare in a 52-card deck (about a 7.7% chance per round), so most rounds will produce a clear winner.`,
  settings: highCardDrawSettings,
  initialState,
  reducer,
  isTerminal,
  component: HighCardDraw,
};
