import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KlondikeThreesNoRedealState, KlondikeThreesNoRedealAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KlondikeThreesNoRedealGame } from "./Game.js";

export const klondikeThreesNoRedealPlugin: GamePlugin<KlondikeThreesNoRedealState, KlondikeThreesNoRedealAction, Record<string, never>> = {
  id: "klondike-threes-no-redeal",
  title: "Klondike by Threes (No Redeal)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with draw-3 and a single pass through the stock — no recycling.",
  howToPlay: `Klondike by Threes (No Redeal) combines the two hardest Klondike rules: only the top of every triple-flip is playable, AND you only get a single pass through the stock.

Setup: 7 tableau columns (1–7 cards, top face-up), 24-card stock, 4 foundations.

Draw: Click the stock to flip three cards face-up to the waste. Only the top of those three is immediately playable. Once the stock is empty, no recycling — that's the only pass you get.

Tableau: Build down in alternating colors. Move single cards or valid alt-color sequences. Empty columns accept Kings only.

Scoring: Standard Klondike scoring — +10 to foundation, +5 waste-to-tableau, +5 reveals.

Tips: This is one of the toughest single-deck variants. Plan your stock pulls carefully — each card you fail to play is permanently buried.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: KlondikeThreesNoRedealGame,
} as unknown as GamePlugin;
