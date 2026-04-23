import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FifteensState, FifteensAction, FifteensSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FifteensGame } from "./Game.js";

export const fifteensSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

export const fifteensPlugin: GamePlugin<FifteensState, FifteensAction, typeof fifteensSettings> = {
  id: "fifteens",
  title: "Fifteens",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Remove sets of cards summing to 15 and clear the deck — solitaire with arithmetic.",
  howToPlay: `Fifteens is a solitaire card game using a standard 52-card deck. The goal is to clear all the cards by removing groups that add up to exactly 15.

At the start, three cards are dealt face-up. Card values are: Ace = 1, numbered cards = their face value, and Jack, Queen, King = 10 each.

Click any combination of the face-up cards that adds up to exactly 15. The running sum of selected cards is shown below the face-up area. When you have a valid group (sum equals 15), click Remove to discard them. New cards are automatically drawn from the deck to refill empty slots.

You can remove any number of cards at once as long as they sum to exactly 15 — for example, a single 15 is not possible with standard cards, but you could remove 8+7, 9+6, 5+4+6, 10+5, or many other combinations. Think ahead: some configurations may become stuck.

The game ends when the deck is empty and no face-up cards remain (you win), or when no valid group of 15 can be formed from the remaining visible cards (you lose). Score is based on how few moves it took to clear the deck.`,
  settings: fifteensSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: FifteensGame,
};
