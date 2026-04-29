import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneTowerState, CarcassonneTowerAction, CarcassonneTowerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneTowerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneTowerPlugin: GamePlugin<CarcassonneTowerState, CarcassonneTowerAction, typeof settings> = {
  id: "carcassonne-tower",
  title: "Carcassonne: The Tower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tower expansion; players build towers and capture meeples.",
  howToPlay: `Carcassonne: The Tower is a single-player tile-placement puzzle. Tower expansion; players build towers and capture meeples. Tiles draw from a randomized queue, and your job is to place each one onto a small grid in a way that maximises end-of-game scoring.

How it works: Place 16 tiles on a 5x5 grid. Towers (matching adjacencies) capture neighbouring meeples for big bonuses. Each adjacent same-type tile scores +1; corners score +2 extra.

On each turn, the next tile is shown above the grid. Click any empty cell to drop the tile in place. Once placed, a tile cannot be moved or removed — every choice is permanent. Plan ahead by considering not just the current tile but the full queue of upcoming pieces.

After 16 placements, the game ends and your final score is computed from the board layout. The scoring rule rewards adjacency between matching tile types, so clustering same-coloured tiles is the dominant strategy.

The shuffle is fully seeded; identical seeds produce identical queues, allowing for puzzle replay and head-to-head comparison. There is no opponent — this is a pure puzzle. Aim for high adjacency density to score well above baseline.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneTowerSettings),
  reducer,
  isTerminal,
  component: CarcassonneTowerGame,
};
