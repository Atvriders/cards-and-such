import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulStainedGlassState, AzulStainedGlassAction, AzulStainedGlassSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulStainedGlassGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const azulStainedGlassPlugin: GamePlugin<AzulStainedGlassState, AzulStainedGlassAction, typeof settings> = {
  id: "azul-stained-glass",
  title: "Azul: Stained Glass of Sintra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Window pane drafting; column clears replace mosaic wall scoring.",
  howToPlay: `Azul: Stained Glass of Sintra is a single-player tile-placement puzzle. Window pane drafting; column clears replace mosaic wall scoring. Tiles draw from a randomized queue, and your job is to place each one onto a small grid in a way that maximises end-of-game scoring.

How it works: Place 20 tiles on a 5x5 wall. Each completed row of one colour pays +6; complete columns pay +8. Adjacency adds +1 per matching neighbour.

On each turn, the next tile is shown above the grid. Click any empty cell to drop the tile in place. Once placed, a tile cannot be moved or removed — every choice is permanent. Plan ahead by considering not just the current tile but the full queue of upcoming pieces.

After 20 placements, the game ends and your final score is computed from the board layout. The scoring rule rewards adjacency between matching tile types, so clustering same-coloured tiles is the dominant strategy.

The shuffle is fully seeded; identical seeds produce identical queues, allowing for puzzle replay and head-to-head comparison. There is no opponent — this is a pure puzzle. Aim for high adjacency density to score well above baseline.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulStainedGlassSettings),
  reducer,
  isTerminal,
  component: AzulStainedGlassGame,
};
