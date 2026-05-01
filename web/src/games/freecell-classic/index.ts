import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FreecellClassicState, FreecellClassicAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FreecellClassicGame } from "./Game.js";

export const freecellClassicPlugin: GamePlugin<FreecellClassicState, FreecellClassicAction, Record<string, never>> = {
  id: "freecell-classic",
  title: "FreeCell (Classic)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard FreeCell — single deck, 4 free cells, 8 cascades, 4 foundations.",
  howToPlay: `FreeCell (Classic) is the canonical FreeCell: single 52-card deck, all dealt face-up across 8 cascades, with 4 free cells as buffer storage and 4 foundations to fill.

Setup: First 4 cascades hold 7 cards, last 4 hold 6. Everything visible from move one.

Tableau: Build down in alternating colors. Multi-card moves are allowed up to (1 + empty cells) × 2^(empty cascades).

Free cells: Each holds exactly one card as a temporary parking spot.

Foundations: Build up by suit from Ace to King.

Scoring: Score = max(0, 52 − moves). Most deals are solvable with optimal play.

Tips: Plan several moves ahead before parking a card. Bring Aces out as soon as you reasonably can.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: FreecellClassicGame,
} as unknown as GamePlugin;
