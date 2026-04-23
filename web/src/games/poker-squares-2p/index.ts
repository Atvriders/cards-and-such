import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PokerSquares2PState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PokerSquares2PGame } from "./Game.js";

export const pokerSquares2PSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type PokerSquares2PAction = { type: "place"; cellIndex: number };

export const pokerSquares2PPlugin: GamePlugin<PokerSquares2PState, PokerSquares2PAction, typeof pokerSquares2PSettings> = {
  id: "poker-squares-2p",
  title: "Poker Squares (2P)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 25 cards on a 5×5 grid to form the best 10 poker hands. Beat the bot's score.",
  howToPlay: `Poker Squares (2P) is a competitive placement game where you and a bot build 5×5 poker grids from the same sequence of cards.

Setup: a full deck is shuffled. Both players share the same 25-card sequence drawn one at a time.

Gameplay: each time a card is shown, click an empty cell in your grid to place it there. Simultaneously, the bot places the same card on its own grid. You cannot see the bot's grid in real time — focus on your own strategy.

Scoring: after all 25 cards are placed, evaluate 10 five-card poker hands — 5 rows and 5 columns. American point values: Royal Flush 100 · Straight Flush 75 · Four of a Kind 50 · Full House 25 · Flush 20 · Straight 15 · Three of a Kind 10 · Two Pair 5 · One Pair 2 · High Card 0.

Winning: the player whose grid totals the most points wins. Tie goes to the player (score 50).

Strategy: plan ahead — placing a card early in one row can ruin another. Watch for flush opportunities within columns and try to form pairs quickly before better ranks get wasted.`,
  settings: pokerSquares2PSettings,
  initialState,
  reducer,
  isTerminal,
  component: PokerSquares2PGame,
};
