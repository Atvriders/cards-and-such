import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KlondikeThreesStandardState, KlondikeThreesStandardAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KlondikeThreesStandardGame } from "./Game.js";

export const klondikeThreesStandardPlugin: GamePlugin<KlondikeThreesStandardState, KlondikeThreesStandardAction, Record<string, never>> = {
  id: "klondike-threes-standard",
  title: "Klondike by Threes (Standard)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with draw-3 and standard scoring; unlimited redeals.",
  howToPlay: `Klondike by Threes (Standard) is the casino-spec draw-three Klondike with classic point scoring and unlimited redeals.

Setup: 7 tableau columns (1–7 cards, top face-up), 24-card stock, 4 foundations.

Draw: Click the stock to flip three cards face-up to the waste pile. Only the top of those three is playable. When the stock is empty, click again to recycle the waste back into the stock — there is no redeal limit.

Tableau: Build down in alternating colors. Move single cards or valid alt-color sequences. Empty columns accept Kings only.

Scoring (standard): +10 for any card to a foundation. +5 for waste-to-tableau plays. +5 every time a face-down tableau card is revealed by a move.

Tips: With draw-3, plan ahead — buried cards rotate slowly. Use Auto-move once the endgame is trivial.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: KlondikeThreesStandardGame,
} as unknown as GamePlugin;
