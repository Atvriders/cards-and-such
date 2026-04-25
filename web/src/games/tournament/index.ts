import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TournamentState, TournamentAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tournament } from "./Tournament.js";

export const tournamentPlugin: GamePlugin<TournamentState, TournamentAction, Record<string, never>> = {
  id: "tournament",
  title: "Tournament",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck patience: build 4 foundations up (A→K) and 4 down (K→A) by suit from 8 tableau columns.",
  howToPlay: `Tournament is a two-deck patience with a dual-direction foundation challenge and a reserve buffer.

Setup: Two standard decks (104 cards) are shuffled together. Eight tableau columns of 12 cards each are dealt face-up. The remaining 8 cards go to the stock. Four reserve cells sit empty.

Foundations: Two sets of four foundations — the left group builds Ace to King in each suit, the right group builds King to Ace in each suit. Both sets must be completed to win. Each suit has one ascending and one descending pile.

Tableau: Only the top (exposed) card of each column is playable. You may stack a card on another if it is one rank lower and of the opposite color (red-on-black alternating).

Reserve: Four empty cells that each hold one card. Park a stuck card in a reserve cell to free up your play. Reserve cards may be sent directly to foundations.

Stock & Waste: Draw one card from the stock at a time to the waste. The waste top is playable on foundations or as a reserve card.

Scoring: +5 per card placed on any foundation. Maximum 520.

Tips: Use reserve cells sparingly — they fill up fast. Target low cards for ascending piles and high cards for descending piles simultaneously.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: Tournament,
};
