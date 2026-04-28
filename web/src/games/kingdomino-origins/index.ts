import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingdominoOriginsState, KingdominoOriginsAction, KingdominoOriginsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingdominoOriginsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kingdominoOriginsPlugin: GamePlugin<KingdominoOriginsState, KingdominoOriginsAction, typeof settings> = {
  id: "kingdomino-origins",
  title: "Kingdomino Origins",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Prehistoric Kingdomino with cave/forest/savanna tiles on a 5x5 grid.",
  howToPlay: `Kingdomino Origins is the prehistoric reskin of Kingdomino. You receive 13 random tiles drawn from five terrain types: cave, forest, savanna, mountain, and lake.

Click any empty cell on the 5x5 grid to place the next tile from the queue.

Scoring (computed at game end):
• Each tile scores points equal to the size of its connected matching-terrain group, multiplied by 2 if the group includes 3 or more tiles. Groups of 1 or 2 tiles score their raw size only. So a 4-tile cluster is worth 8 points; a 5-tile cluster is worth 10.
• Lake tiles score double if any neighbor is a different terrain (lakes are valuable on borders).
• Bonus +12 if you reach 12 tiles placed before running out of moves.

Focus on growing one large cluster of forest or savanna for guaranteed points. Treat lakes as edge filler — they thrive on contact with anything different. Caves and mountains are harder to cluster, so keep them in pairs at minimum.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KingdominoOriginsSettings),
  reducer,
  isTerminal,
  component: KingdominoOriginsGame,
};
