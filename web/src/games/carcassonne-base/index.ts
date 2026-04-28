import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneBaseState, CarcassonneBaseAction, CarcassonneBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneBasePlugin: GamePlugin<CarcassonneBaseState, CarcassonneBaseAction, typeof settings> = {
  id: "carcassonne-base",
  title: "Carcassonne",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place landscape tiles on a 6x6 board to form cities and roads.",
  howToPlay: `Carcassonne is a classic tile-placement game where you build a medieval landscape one tile at a time. In this small adaptation, you have a 6x6 grid and 18 random landscape tiles. Each tile shows one of three features: city, road, or field.

Click any empty cell to place the next tile from the queue. Tiles do not need to match neighbors, but adjacency is what scores points.

Scoring at the end:
• Each city tile adjacent to another city tile: +6 points
• Each road tile adjacent to another road tile: +3 points
• Each field tile in a row of 3 or more fields: +2 points per field

The more clusters you create, the more you score. Try to plan ahead — tiles arrive in a random order, but you choose where to put them. Empty cells are wasted potential. Aim to fill as much of the board as possible while building large connected city clusters for the highest score.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneBaseSettings),
  reducer,
  isTerminal,
  component: CarcassonneBaseGame,
};
