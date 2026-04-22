import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CrescentState, CrescentAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Crescent } from "./Crescent.js";

export const crescentSettings = {} as const;

export const crescentPlugin: GamePlugin<CrescentState, CrescentAction, typeof crescentSettings> = {
  id: "crescent",
  title: "Crescent",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck solitaire with 16 crescent piles and dual foundations building up and down.",
  howToPlay: `Crescent is a two-deck patience game with a dramatic arc-shaped layout of 16 tableau piles and eight foundation piles. Your goal is to move all 104 cards onto the foundations.

Deal: One Ace and one King of each suit are placed face-up on the eight foundations at the start. The remaining 96 cards are divided evenly across 16 crescent piles, all face-up, 6 cards each.

Foundations: Four Ace foundations build upward — Ace, 2, 3 ... King — each in one suit. Four King foundations build downward — King, Queen, Jack ... Ace — each in one suit. Both sets must be completed to win.

Tableau: The 16 crescent piles build downward in alternating colors. Move sequences of descending alternating-color cards together. Any card can go on an empty pile.

Redeal: Up to three times per game you may use the Redeal button to cycle the bottom card of every crescent pile to the top, potentially unblocking buried cards.

Scoring: +5 per card moved to any foundation. Use Auto-move to quickly send safe cards to foundations.

Tips: Monitor both foundations so you don't accidentally bury a card you need for either direction. Redeals are precious — save them for when you are truly stuck.`,
  settings: crescentSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Crescent,
};
