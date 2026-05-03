import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { QuadrilleState, QuadrilleAction, QuadrilleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Quadrille } from "./Quadrille.js";

export const quadrilleSettings = {} as const;

export const quadrillePlugin: GamePlugin<QuadrilleState, QuadrilleAction, typeof quadrilleSettings> = {
  id: "quadrille",
  title: "Quadrille",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Dance the cards around the sixes — build up to King and down to Ace.",
  howToPlay: `Quadrille is an elegant Victorian solitaire in which the four 6s form the heart of a dance pattern. Each suit builds in two directions from its 6, mirroring the steps of a quadrille dance.

Setup: All four 6s are removed and placed in a 2×2 grid as the central piles. The remaining 48 cards are shuffled into the stock.

Foundations: Each suit has two piles adjacent to its 6. The upper pile builds upward: 7, 8, 9, 10, Jack, Queen, King. The lower pile builds downward: 5, 4, 3, 2, Ace. Together with the starting 6, each suit accounts for all 13 cards.

Play: Draw one card at a time from the stock to the waste. Click a foundation to play the waste top onto it, provided the rank and suit match the required next card.

When the stock is exhausted, you may recycle the waste up to twice to get another pass through the deck.

Goal: Fill all eight foundation piles to win — four piles running up to King, four piles running down to Ace.

Tip: Because you can only access one card at a time, it pays to plan which cards you still need. Keep careful track of how many recycles you have left and prioritize key blocking cards.`,
  settings: quadrilleSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  hint: (state: QuadrilleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-quadrille-primary"]', pulses: 3 };
  },
  component: Quadrille,
};
