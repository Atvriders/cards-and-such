import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TripleFreecellState, TripleFreecellAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TripleFreecellGame } from "./Game.js";

export const tripleFreecellPlugin: GamePlugin<TripleFreecellState, TripleFreecellAction, Record<string, never>> = {
  id: "triple-freecell",
  title: "Triple FreeCell",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-deck FreeCell with 13 cascades, 8 free cells, and 12 foundations.",
  howToPlay: `Triple FreeCell uses three standard 52-card decks (156 cards), all dealt face-up across 13 cascades of 12 cards each.

Setup: 13 cascades, 8 free cells (more than classic), 12 foundation piles to fill (three runs per suit).

Tableau: Build down in alternating colors. Multi-card moves are allowed up to (1 + empty cells) × 2^(empty cascades).

Free cells: Each holds exactly one card. With 8 cells you have substantial buffer compared to classic FreeCell.

Foundations: Build up by suit Ace to King. There are 12 foundation piles total.

Tips: With 13 long columns, plan your sequences carefully. Empty columns are extremely valuable for relocating long sequences.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: TripleFreecellGame,
} as unknown as GamePlugin;
