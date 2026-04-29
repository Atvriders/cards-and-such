import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatchworkState, PatchworkAction, PatchworkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatchworkGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const patchworkPlugin: GamePlugin<PatchworkState, PatchworkAction, typeof settings> = {
  id: "patchwork",
  title: "Patchwork",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tetris-like quilt building; button economy time track governs turns.",
  howToPlay: `Patchwork is a single-player tile-placement puzzle. Tetris-like quilt building; button economy time track governs turns. Tiles draw from a randomized queue, and your job is to place each one onto a small grid in a way that maximises end-of-game scoring.

How it works: Place 16 patches on a 5x5 quilt. Empty cells at end cost -2 each; same-colour adjacencies pay +1. Aim to fill the quilt and cluster colours.

On each turn, the next tile is shown above the grid. Click any empty cell to drop the tile in place. Once placed, a tile cannot be moved or removed — every choice is permanent. Plan ahead by considering not just the current tile but the full queue of upcoming pieces.

After 16 placements, the game ends and your final score is computed from the board layout. The scoring rule rewards adjacency between matching tile types, so clustering same-coloured tiles is the dominant strategy.

The shuffle is fully seeded; identical seeds produce identical queues, allowing for puzzle replay and head-to-head comparison. There is no opponent — this is a pure puzzle. Aim for high adjacency density to score well above baseline.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatchworkSettings),
  reducer,
  isTerminal,
  component: PatchworkGame,
};
