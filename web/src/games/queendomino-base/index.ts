import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QueendominoBaseState, QueendominoBaseAction, QueendominoBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QueendominoBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const queendominoBasePlugin: GamePlugin<QueendominoBaseState, QueendominoBaseAction, typeof settings> = {
  id: "queendomino-base",
  title: "Queendomino",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Kingdomino variant with castle-bonus tiles on a 5x5 grid.",
  howToPlay: `Queendomino expands Kingdomino with extra building tiles. You receive 14 random terrain or castle tiles to place on a 5x5 grid.

Tiles are one of six kinds: forest, water, field, swamp, mountain, or castle. Click an empty cell to place the next tile from the queue.

Scoring at the end:
• Each terrain tile scores 1 point per other matching terrain orthogonally adjacent to it.
• Each castle tile scores +5 points and additionally doubles the score from any one adjacent terrain tile (chosen automatically: the highest-scoring neighbor).
• Bonus +15 if every cell on the board is filled.

The castle bonus rewards placing castles next to dense terrain clusters. A castle next to a 3-tile forest cluster grows in value rapidly. Don't waste castles in isolated corners.

Aim for compact, connected clusters of one or two terrain types, with a strategic castle adjacent to the largest. With practice you'll consistently exceed 60 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QueendominoBaseSettings),
  reducer,
  isTerminal,
  component: QueendominoBaseGame,
};
