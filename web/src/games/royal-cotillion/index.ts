import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { RoyalCotillionState, RoyalCotillionAction, RoyalCotillionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoyalCotillion } from "./RoyalCotillion.js";

export const royalCotillionSettings = {} as const;

export const royalCotillionPlugin: GamePlugin<RoyalCotillionState, RoyalCotillionAction, typeof royalCotillionSettings> = {
  id: "royal-cotillion",
  title: "Royal Cotillion",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck patience: fill eight odd foundations and eight even foundations by suit.",
  howToPlay: `Royal Cotillion is an elegant two-deck patience game with a dazzling mechanical twist: cards are sorted not just by suit but by whether their rank is odd or even.

Setup: Two standard decks (104 cards) are shuffled together. Twenty-four cards are dealt face-up into eight reserve columns of three. The remaining 80 cards form the stock. Sixteen foundation piles wait to be filled: eight odd foundations (one per suit per deck) and eight even foundations.

Foundations: Odd foundations build in the sequence Ace, 3, 5, 7, 9, Jack, King — all seven odd ranks in ascending order. Even foundations build in the sequence 2, 4, 6, 8, 10, Queen — six even ranks ascending.

Play: Draw one card from the stock to the waste. Click any reserve top or the waste top, then click a foundation to play it there (if the rank and suit are correct). Recycles of the waste are limited to two.

Goal: Fill all 16 foundations to win (104 cards placed).

Tip: The reserve exposes three cards per column — be selective about which cards you play first to avoid burying critical ranks. Managing both odd and even sequences simultaneously is the central challenge.`,
  settings: royalCotillionSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: RoyalCotillionState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-royal-cotillion-primary"]', pulses: 3 };
  },
  component: RoyalCotillion,
};
