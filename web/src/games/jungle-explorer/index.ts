import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JungleExplorerState, JungleExplorerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JungleExplorer } from "./JungleExplorer.js";

export const jungleExplorerSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["5", "7", "9"] as const,
    default: "7",
  },
} as const;

type JungleExplorerSettingsType = SettingsOf<typeof jungleExplorerSettings>;

export const jungleExplorerPlugin: GamePlugin<JungleExplorerState, JungleExplorerAction, typeof jungleExplorerSettings> = {
  id: "jungle-explorer",
  title: "Jungle Explorer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a hidden jungle grid, collect treasure, and avoid deadly traps and beasts.",
  howToPlay: `Jungle Explorer is a grid exploration board game. You play as an intrepid explorer dropped into the centre of a dense jungle grid — 5x5, 7x7, or 9x9 — filled with hidden secrets.

Your goal is to collect all treasure scattered across the jungle before you run out of moves or health points. Move your character up, down, left, or right one cell at a time. Unvisited cells are shown as question marks — you never know what you'll find until you step there.

The jungle contains five types of special cells. Treasure cells give you +1 treasure toward your collection goal. Trap cells cost 1 HP from triggered snares. Beast cells are dangerous encounters that cost 2 HP. River cells provide safe crossing with no effect. Camp cells are the starting base and restore 1 HP when revisited.

You begin with 5 HP and a move limit equal to twice the number of cells in the grid. If HP reaches zero or you exhaust your moves, the expedition ends. Collecting all treasure immediately wins the round.

Your score is calculated from the fraction of treasure collected (up to 70 points) plus remaining HP (up to 30 points). A perfect run scores 100. On larger grids, beasts and traps are more numerous so careful routing is essential — avoid revisiting known empty cells and prioritise high-density unexplored zones.`,
  settings: jungleExplorerSettings,
  initialState: (seed: number, settings: JungleExplorerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: JungleExplorer,
};
