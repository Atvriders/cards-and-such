import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { KingdomBuilderState, KingdomBuilderAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdomBuilder } from "./Game.js";

export const kingdomBuilderPlugin = {
  id: "kingdom-builder",
  title: "Kingdom Builder",
  category: "strategy",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place tiles on a 5×5 grid to score points. Cluster matching tiles and build combos!",
  howToPlay: `Kingdom Builder is a tile-placement strategy game played on a 5×5 grid. You place 15 tiles drawn from a pool to maximize your score before the grid fills up.

You always hold a hand of 3 tiles. Select a tile from your hand, then click any empty cell on the grid to place it. A replacement tile is drawn automatically. You can also use the Swap button to discard one tile and draw a different one.

Scoring: Each tile has a base value — Castles (10), Mines (6), Villages (5), Farms (4), Forests (3). Additional bonus points are awarded for smart placement. Adjacent matching tiles each earn +2. Castles score +4 for each adjacent Village. Mines score +3 for each adjacent Forest.

Strategy: Build clusters of the same tile type for the adjacency bonus. Surround Castles with Villages and Mines with Forests for maximum combo points. Avoid scattering tiles randomly — every placement matters. Target 150+ points for a top score on the 15-tile run!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: KingdomBuilderState, action: KingdomBuilderAction) => KingdomBuilderState,
  isTerminal,
  component: KingdomBuilder,
} as unknown as GamePlugin;
