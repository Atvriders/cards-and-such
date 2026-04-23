import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CapricieseState, CapricieseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const capricieseSettings = {} as const;

export const capriciesePlugin: GamePlugin<CapricieseState, CapricieseAction, typeof capricieseSettings> = {
  id: "capricieuse",
  title: "Capricieuse",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck open solitaire — build alternating-color columns to 8 foundations.",
  howToPlay: `Capricieuse (French for "capricious") is a two-deck open solitaire with 12 wide tableau columns.

Setup: Two standard decks (104 cards) are shuffled and dealt face-up across 12 tableau columns — the first eight columns receive nine cards each, the last four receive eight cards each. Eight foundation piles start empty.

Foundations: Build each of the eight foundations upward from Ace to King in the same suit (four per deck copy). The first Ace of any suit starts one foundation; the second Ace starts a matching foundation. All 104 cards must reach the foundations to win.

Tableau building: Move cards or sequences of cards between tableau columns. A card may be placed on a column whose top card is one rank higher and the opposite color (same as Klondike — red on black, black on red). You may move a face-up sequence of consecutive alternating-color cards as a unit. Empty columns accept any card or sequence.

Goal: Transfer all 104 cards to the eight foundations.

Tips: With all cards visible from the start, plan long sequence moves to open up Aces and low cards. The two-deck format means you'll often have two cards of the same rank and suit competing — build carefully so neither gets buried.

Scoring: +10 per card on a foundation. Use Auto-move to sweep ready cards up.`,
  settings: capricieseSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Game,
};
