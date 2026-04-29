import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneBigTopState, CarcassonneBigTopAction, CarcassonneBigTopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneBigTopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneBigTopPlugin: GamePlugin<CarcassonneBigTopState, CarcassonneBigTopAction, typeof settings> = {
  id: "carcassonne-big-top",
  title: "Carcassonne: Under the Big Top",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Circus-themed expansion; acrobat pyramids and ringmaster scoring.",
  howToPlay: `Carcassonne: Under the Big Top is a single-player tile-placement puzzle. Circus-themed expansion; acrobat pyramids and ringmaster scoring. Tiles draw from a randomized queue, and your job is to place each one onto a small grid in a way that maximises end-of-game scoring.

How it works: Acrobats stack on adjacent same-type tiles (+1 each). Ringmaster bonuses: +5 for every 3-of-a-kind cluster anywhere on the board.

On each turn, the next tile is shown above the grid. Click any empty cell to drop the tile in place. Once placed, a tile cannot be moved or removed — every choice is permanent. Plan ahead by considering not just the current tile but the full queue of upcoming pieces.

After 16 placements, the game ends and your final score is computed from the board layout. The scoring rule rewards adjacency between matching tile types, so clustering same-coloured tiles is the dominant strategy.

The shuffle is fully seeded; identical seeds produce identical queues, allowing for puzzle replay and head-to-head comparison. There is no opponent — this is a pure puzzle. Aim for high adjacency density to score well above baseline.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneBigTopSettings),
  reducer,
  isTerminal,
  component: CarcassonneBigTopGame,
};
