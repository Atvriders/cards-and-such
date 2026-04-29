import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarenparkState, BarenparkAction, BarenparkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarenparkGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const barenparkPlugin: GamePlugin<BarenparkState, BarenparkAction, typeof settings> = {
  id: "barenpark",
  title: "Bärenpark",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bear park tile-placement; polyomino enclosures unlock new park tiles.",
  howToPlay: `Bärenpark is a single-player tile-placement puzzle. Bear park tile-placement; polyomino enclosures unlock new park tiles. Tiles draw from a randomized queue, and your job is to place each one onto a small grid in a way that maximises end-of-game scoring.

How it works: Build a bear park: 16 tiles on 5x5. Every fully-surrounded tile (4 same-type neighbours) is a 'pen' and pays +4. Other tiles pay +1 per same neighbour.

On each turn, the next tile is shown above the grid. Click any empty cell to drop the tile in place. Once placed, a tile cannot be moved or removed — every choice is permanent. Plan ahead by considering not just the current tile but the full queue of upcoming pieces.

After 16 placements, the game ends and your final score is computed from the board layout. The scoring rule rewards adjacency between matching tile types, so clustering same-coloured tiles is the dominant strategy.

The shuffle is fully seeded; identical seeds produce identical queues, allowing for puzzle replay and head-to-head comparison. There is no opponent — this is a pure puzzle. Aim for high adjacency density to score well above baseline.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarenparkSettings),
  reducer,
  isTerminal,
  component: BarenparkGame,
};
