import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SpiderOneSuitState, SpiderOneSuitAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiderOneSuitGame } from "./Game.js";

export const spiderOneSuitPlugin: GamePlugin<SpiderOneSuitState, SpiderOneSuitAction, Record<string, never>> = {
  id: "spider-one-suit",
  title: "Spider (One Suit)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Easy Spider — every card is a spade. Build descending K-A runs to clear them.",
  howToPlay: `Spider (One Suit) is the easy mode of Spider Solitaire — all 104 cards are spades, so every sequence trivially matches suit.

Setup: 10 tableau columns. First 4 columns get 6 cards (5 face-down + 1 face-up), the rest get 5 (4+1). 50 cards remain in the stock for 5 deal-rows.

Tableau: Build down by rank (any "suit" — they're all spades). Move single cards or descending sequences. Empty columns accept any card.

Goal: Build 8 complete K→A runs in the same suit. Each completed run is automatically removed to a foundation.

Stock: Click the stock to deal one new card to every column. You may not deal a row if any column is empty.

Tips: Even at one suit, this is still tactical. Plan your descending runs carefully — once you cover up a card with a higher rank from a different stack, you'll need to move it to clear the cover.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: SpiderOneSuitGame,
} as unknown as GamePlugin;
