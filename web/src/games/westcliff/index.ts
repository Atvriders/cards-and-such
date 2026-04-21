import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WestcliffState, WestcliffAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Westcliff } from "./Westcliff.js";

export const westcliffSettings = {} as const;

export const westcliffPlugin: GamePlugin<WestcliffState, WestcliffAction, typeof westcliffSettings> = {
  id: "westcliff",
  title: "Westcliff",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ten columns of three cards. One pass through the stock. Build down alternating, up same-suit.",
  howToPlay: `Westcliff deals 30 cards into ten tableau columns of three cards each. The bottom two cards of each column are face-down, and only the top card is face-up. The remaining 22 cards form the stock. There are no redeals.

Foundations: Build each of the four foundations up from Ace to King by suit.

Tableau: Build down in alternating colors (red on black, black on red), like Klondike. You may move any face-up card or valid sequence onto another column. When a face-down card is exposed, it automatically flips face-up. Empty columns accept any card or sequence.

Stock: Click the stock to deal one card at a time onto the waste pile. Only the top card of the waste can be played. There is only one pass through the stock — plan accordingly.

Strategy: Be conservative with the stock — each card is only dealt once. Focus on uncovering face-down cards early so you have more options. Avoid leaving empty columns idle. Build long alternating-color sequences in the tableau to free space for stock cards. Watch the Aces; they must be uncovered to start foundations.`,
  settings: westcliffSettings,
  initialState: (seed) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Westcliff,
};
