import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KingsRowState, KingsRowAction } from "./state.js";
import { KingsRowGame } from "./Game.js";

const settings = {} as const;

export const kingsRowPlugin: GamePlugin<KingsRowState, KingsRowAction, typeof settings> = {
  id: "kings-row",
  title: "Kings Row",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A tableau solitaire where foundations build downward from King to Ace by color.",
  howToPlay: `Kings Row is a solitaire variant that reverses the usual foundation direction — instead of building Ace upward to King, you build King downward to Ace, grouped by color rather than suit.

Setup: All 52 cards are dealt face-up into 8 tableau columns. The first four columns receive 7 cards; the last four receive 6. No stock, no waste — you start with perfect information.

Goal: Build four foundation piles down from King to Ace. Two foundations hold black cards (spades and clubs mixed freely), and two hold red cards (hearts and diamonds mixed freely). Each foundation starts empty and accepts any King of the matching color.

Tableau: Build columns downward in alternating colors (red on black, black on red), just like Klondike. You may move any face-up sequence of alternating-color cards together. Empty columns accept any single card or sequence.

Foundations: Send any top-of-column card to a matching-color foundation if it is exactly one rank lower than the foundation's current bottom card (or any King to start an empty foundation).

Strategy: Unlike Klondike, you need Kings early — they start foundations. Free up Kings first, then systematically build downward sequences.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: KingsRowGame,
};
