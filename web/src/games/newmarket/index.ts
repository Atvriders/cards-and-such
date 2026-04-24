import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NewmarketState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NewmarketGame } from "./Game.js";

export const newmarketSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type NewmarketAction =
  | { type: "placeBet"; amount: number }
  | { type: "playCard"; cardId: string }
  | { type: "pass" };

export const newmarketPlugin: GamePlugin<NewmarketState, NewmarketAction, typeof newmarketSettings> = {
  id: "newmarket",
  title: "Newmarket",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic British stops game. Play sequences to collect chips from the boodle board.",
  howToPlay: `Newmarket is a classic British stops card game for 4 players. You play against three bots, collecting chips by playing special "boodle" cards.

The Boodle Board: four special cards are displayed — 10♥, J♦, Q♣, K♠. These "horses" hold chips. When you play one of them during the game, you collect all the chips from that spot!

Setup: 52 cards are dealt (13 per player) plus a dead hand nobody uses. Each boodle spot starts with 2 house chips. You may optionally bet 1 chip to add to every boodle pot.

Gameplay: on your turn, play any card from your hand to start a sequence. The player (including bots) who holds the next card in suit (rank+1) must play it, continuing the sequence until no one has the next card. That player who "stops" the sequence leads a new one from their hand.

Boodle cards: whenever any player plays 10♥, J♦, Q♣, or K♠, they instantly collect all chips from that boodle spot.

Winning: the first to empty their hand wins. Collect boodle chips to build your fortune. Score is based on your final chip count.`,
  settings: newmarketSettings,
  initialState,
  reducer,
  isTerminal,
  component: NewmarketGame,
};
