import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BrainiacState, BrainiacAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game } from "./Game.js";

export const brainiacSettings = {} as const;

export const brainiacPlugin: GamePlugin<BrainiacState, BrainiacAction, typeof brainiacSettings> = {
  id: "brainiac",
  title: "Brainiac",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four columns of 13 cards each — build same-suit up to foundations.",
  howToPlay: `Brainiac is a stripped-down, brain-teasing solitaire played with one standard 52-card deck.

Setup: All 52 cards are dealt face-up into four tableau columns of 13 cards each. No stock, no waste — everything is on the table from the start.

Tableau: Only the top card of each column is playable. You may move a single top card onto another column only if the receiving column's top card shares the same suit and is exactly one rank lower. So a 7♣ can be placed on a 6♣, but not on a 6♥. An empty column accepts any single card.

Foundations: There are four foundation piles, one per suit. Build each foundation up from Ace (1) through King (13) in the same suit. Once a card reaches a foundation it stays there permanently.

Goal: Move all 52 cards onto the four foundations.

Strategy: Because you can only move one card at a time and tableau builds must stay in the same suit, planning is critical. Try to free Aces early, keep columns from clogging with buried low cards, and resist filling empty columns with a card that doesn't help sequence-building.

Scoring: +10 points for each card sent to a foundation.

Use the Auto-move button to automatically transfer all eligible cards to foundations in one click.`,
  settings: brainiacSettings,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: Game,
};
