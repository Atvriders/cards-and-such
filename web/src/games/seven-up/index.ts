import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SevenUpState, SevenUpAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenUp } from "./SevenUp.js";

export const sevenUpPlugin: GamePlugin<SevenUpState, SevenUpAction, Record<string, never>> = {
  id: "seven-up",
  title: "Seven Up",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike-style solitaire where foundations start at 7 and wrap around through Ace.",
  howToPlay: `Seven Up is a Klondike variant with a crucial twist: foundations begin at rank 7 instead of Ace.

Setup: 52 cards are dealt into 7 tableau columns (1 through 7 cards each), just like Klondike. Only the top card of each column is face-up. The remaining 24 cards form the stock.

Foundations: There are 4 foundations, one per suit. Each builds starting from 7 upward: 7, 8, 9, 10, J, Q, K, then wraps to A, 2, 3, 4, 5, 6. A foundation is complete when all 13 ranks are placed.

Tableau: Build downward in alternating colors (red-on-black, black-on-red), exactly as in Klondike. Move one card at a time. Empty columns accept any card.

Stock: Click the stock to draw one card to the waste. The waste top is playable. When the stock is empty, recycle the waste into a new stock (unlimited passes).

Scoring: +10 for each card moved to a foundation.

Tips: Sevens are your new "Aces" — get them to the foundations early. Cards ranked Ace through Six feel "blocked" early since they can only go to a foundation after K is placed. Prioritize uncovering and building runs to reach your Sevens quickly.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SevenUp,
};
