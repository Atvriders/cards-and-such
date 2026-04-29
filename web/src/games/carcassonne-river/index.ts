import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneRiverState, CarcassonneRiverAction, CarcassonneRiverSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneRiverGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneRiverPlugin: GamePlugin<CarcassonneRiverState, CarcassonneRiverAction, typeof settings> = {
  id: "carcassonne-river",
  title: "Carcassonne: The River",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Carcassonne river expansion: river, lake, field, bridge tiles.",
  howToPlay: "Carcassonne: The River is a starter expansion that introduces winding river tiles before the regular game begins. In this adaptation you place 14 river-themed tiles on a 5x5 grid. Tile types include river segments, lake junctions, fields, and bridges. Click any empty cell to place the next tile from the queue. Each tile scores 1 base point. Adjacent tiles of the same type each contribute +1 point per matching neighbour. River and lake tiles flow naturally when grouped, simulating river continuity. The strategy is to chain matching tiles together so river segments form long banks and fields cluster into wide commons. After all 14 tiles are placed the board is final-scored. Aim for 25-35 points by clustering. Highly clustered placements deliver multipliers since each pair contributes one point to each of two tiles. Random tile order keeps every game fresh.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneRiverSettings),
  reducer,
  isTerminal,
  component: CarcassonneRiverGame,
};
