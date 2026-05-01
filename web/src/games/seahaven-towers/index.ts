import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SeahavenTowersState, SeahavenTowersAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SeahavenTowersGame } from "./Game.js";

export const seahavenTowersPlugin: GamePlugin<SeahavenTowersState, SeahavenTowersAction, Record<string, never>> = {
  id: "seahaven-towers",
  title: "Seahaven Towers",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "FreeCell variant: 10 columns, 4 cells, suited descending tableau, only Kings fill empties.",
  howToPlay: `Seahaven Towers is a FreeCell-family variant invented for the original Macintosh.

Setup: 10 tableau columns of 5 cards each (50 cards). The remaining 2 cards go into the middle two of 4 cells. Foundations start empty.

Tableau rule: Build down by SAME SUIT (not alternating colors). This is the key difference from FreeCell — sequences must be suited.

Empty columns: Only Kings can fill an empty tableau column.

Cells: Each of the 4 cells holds exactly one card.

Foundations: Build up by suit Ace to King.

Multi-card moves: Limited by (1 + empty cells) × 2^(empty columns), as in FreeCell.

Tips: Suited builds and the King-only empty rule make this much harder than classic FreeCell. Plan carefully — opening an empty column without a King ready is a wasted move.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed, {}),
  reducer,
  isTerminal,
  component: SeahavenTowersGame,
} as unknown as GamePlugin;
