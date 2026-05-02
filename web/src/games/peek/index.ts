import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PeekState, PeekAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Peek } from "./Peek.js";

export const peekPlugin: GamePlugin<PeekState, PeekAction, Record<string, never>> = {
  id: "peek",
  title: "Peek",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deal cards in batches over 12 tableau piles and build four suit foundations.",
  howToPlay: `Peek is a patience game where cards are dealt in rounds over a 12-pile tableau. Your goal is to build all four foundations from Ace to King, one pile per suit.

Setup: 52 cards are shuffled. One card is dealt face-up to each of the 12 tableau piles. The remaining 40 cards are split into rounds of 12 (and one partial round of 4 at the end).

Tableau: Cards build downward by rank only — any suit can go on a card one rank higher. Only the top (exposed) card of each pile is playable. Click a card to auto-move it to a legal foundation or tableau destination.

Foundations: Four piles building from Ace up to King, each in a single suit. Aces start each foundation and play continues in suit order upward.

Dealing: Click "Deal next round" to place the next batch of cards (one per pile) on top of each tableau column. Cards dealt to a column become the new exposed top. Use this strategically — dealing too early can bury Aces.

Scoring: +5 points per card sent to a foundation. Maximum 260.

Tips: Before dealing a new round, send as many exposed cards to foundations as possible. Downward sequences on the tableau free columns for upcoming deals. Cards buried deep can become unreachable once new rounds arrive.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: Peek,
};
