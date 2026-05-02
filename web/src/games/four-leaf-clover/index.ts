import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FourLeafCloverState, FourLeafCloverAction } from "./state.js";
import { FourLeafCloverGame } from "./Game.js";

const settings = {} as const;

export const fourLeafCloverPlugin: GamePlugin<FourLeafCloverState, FourLeafCloverAction, typeof settings> = {
  id: "four-leaf-clover",
  title: "Four Leaf Clover",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four suit-piles in shuffled order with a small reserve — sort them to foundations.",
  howToPlay: `Four Leaf Clover is a focused solitaire where the deck is pre-sorted into four suit piles, each shuffled independently. Your goal is to move all cards to four foundation piles in proper Ace-to-King order.

Setup: The 52-card deck is divided by suit into four "leaf" piles of 13 cards each. Within each leaf, the cards are in random order, all face-up. Four reserve slots start empty.

Goal: Build four foundations, one per suit, from Ace up to King.

Play: At any time you can move the top card of a leaf to its matching foundation (if it is the next needed rank), or park it in any empty reserve slot. Cards in the reserve can similarly go to a foundation, or be placed back on a leaf (if the top card is one rank higher in the same suit).

The challenge is managing the four reserve slots wisely. You can only move one card at a time, so when the needed card is buried, you must carefully cycle through available plays without locking yourself out of the reserve. Think ahead — a full reserve with nowhere to move is game over.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: FourLeafCloverGame,
};
