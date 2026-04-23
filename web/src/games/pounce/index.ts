import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { PounceState, PounceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const pounceSettings = {} as const;

export const pouncePlugin: GamePlugin<PounceState, PounceAction, typeof pounceSettings> = {
  id: "pounce",
  title: "Pounce",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Race the Pounce pile to foundations — draw 3, play only same-suit up.",
  howToPlay: `Pounce is a fast-paced solitaire played with one standard 52-card deck, built around clearing a special pile of 13 cards.

Setup: Deal 13 cards face-down into the Pounce pile, flipping the top card face-up. The remaining 39 cards form the stock. There are four foundation piles for scoring.

Pounce Pile: This is the heart of the game. The top card of the Pounce pile is always playable. When you move it, the next card flips face-up automatically. Your goal is to empty the Pounce pile as fast as possible — doing so wins instantly.

Stock and Waste: Click the stock to draw three cards at a time onto the waste pile. Only the top waste card is playable. When the stock is exhausted, click it again to recycle the waste. You may recycle as many times as needed.

Foundations: Build each foundation up from Ace to King in the same suit. Play from the Pounce pile, waste pile, or directly to the foundation. There are no tableau columns — all plays go directly to a foundation.

Goal: Empty the Pounce pile (win!) or fill all four foundations with 13 cards each.

Scoring: +10 per card played to a foundation. Use Auto-move to play any obvious foundation moves at once.`,
  settings: pounceSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Game,
};
