import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarenparkBaseState, BarenparkBaseAction, BarenparkBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarenparkBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const barenparkBasePlugin: GamePlugin<BarenparkBaseState, BarenparkBaseAction, typeof settings> = {
  id: "barenpark-base",
  title: "Bärenpark",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bear park tile placement; build enclosures from polyominoes.",
  howToPlay: `Bärenpark is a polyomino park-building game. Place 16 randomly-drawn park tiles on a 6x6 grid. Each tile is one cell with one of five features: bear-pit, enclosure, plaza, tree, or path.

Click any empty cell to place the next tile from the queue.

Scoring at game end:
• Bear-pit: +5 per pit (rare, most valuable).
• Enclosure: +1 per enclosure, +2 bonus per enclosure adjacent to another enclosure.
• Plaza: +3 per plaza if it has at least 2 different feature types adjacent.
• Tree: +1 per tree, with a +6 bonus if there are 5 or more trees in total.
• Path: paths score 0 alone but +2 per path tile in a row of 3+ paths (vertical or horizontal).

Bear-pits are gold — every one matters. Enclosures want company. Plazas want diversity around them. Trees want quantity. Paths want lines.

A great Bärenpark scores 40-55. The maximum requires perfect tile order, which you can't control — but smart placement of what arrives gets you there.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarenparkBaseSettings),
  reducer,
  isTerminal,
  component: BarenparkBaseGame,
};
