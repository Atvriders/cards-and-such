import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TripletsState, TripletsAction } from "./state.js";
import { TripletsGame } from "./Game.js";

const settings = {} as const;

export const tripletsPlugin: GamePlugin<TripletsState, TripletsAction, typeof settings> = {
  id: "triplets",
  title: "Triplets",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match three card tops that sum to 15 to clear them from the tableau.",
  howToPlay: `Triplets is a matching solitaire where you identify and remove groups of three cards whose values sum to exactly 15. It rewards sharp mental arithmetic and pattern recognition.

Setup: The 52-card deck is shuffled and dealt face-up into 12 piles of three cards each, leaving 16 cards in the stock. Only the top card of each pile is active and playable.

Goal: Remove all cards from play by forming valid triplets. The game is won when every pile is empty and the stock is exhausted.

Card values: Ace counts as 1. Number cards count at face value. Jack, Queen, and King each count as 10.

Play: Click three pile tops whose values sum to exactly 15, then click "Remove Triplet" to discard them. The next card in each pile is then exposed. If no matching triplet exists among the visible tops, use the Deal button to refill empty piles from the stock one card at a time.

Tips: Plan ahead — removing one triplet may expose cards that complete another. Track which values you still need. Face cards (worth 10) pair with 5 and any 0-value… wait, there are none — so two face cards need a 15−10−10 = −5 gap, which is impossible. Three tens cannot form a valid group. Always look for mixes of high and low cards.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: TripletsGame,
};
