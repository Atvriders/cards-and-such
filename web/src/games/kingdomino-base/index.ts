import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingdominoBaseState, KingdominoBaseAction, KingdominoBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdominoBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingdominoBasePlugin: GamePlugin<KingdominoBaseState, KingdominoBaseAction, typeof settings> = {
  id: "kingdomino-base",
  title: "Kingdomino",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place 1x1 domino-style terrain tiles on a 5x5 grid for matching adjacency.",
  howToPlay: `Kingdomino is a tile-laying game where you build the most beautiful kingdom by connecting matching terrain. In this single-player adaptation, you draw 12 random terrain tiles and place them on a 5x5 grid (25 cells, you'll fill 12 of them).

Each tile shows one of five terrain types: forest, water, field, swamp, or mountain. Click any empty cell to place the next tile from the queue.

Scoring (at end):
• Each tile scores based on the size of its connected matching-terrain group (orthogonally adjacent tiles of the same type form a group). A 1-tile group scores 1, a 2-tile group scores 4, a 3-tile group scores 9, etc — that's group-size squared.
• Bonus: +10 if you complete a 3x3 all-filled rectangle anywhere on the board.

Group tiles together. A single 4-tile cluster (16 points) beats four 1-tile placements (4 points). Plan to keep one type concentrated in a corner.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingdominoBaseSettings),
  reducer,
  isTerminal,
  component: KingdominoBaseGame,
};
