import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { rollingHeightsState, rollingHeightsAction, rollingHeightsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { rollingHeightsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rollingHeightsPlugin: GamePlugin<rollingHeightsState, rollingHeightsAction, typeof settings> = {
  id: "rolling-heights",
  title: "Rolling Heights",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards to stack cylindrical buildings — height determines score.",
  howToPlay: "Rolling Heights is a flip-and-write distilled to a 4x4 city-block grid. Each cell holds a building tower; the die value inscribed becomes the tower's height in stories.\n\nPress Roll to flip the construction card (1-6). Click any unmarked cell to erect a tower of that height there, scoring 2 base points per tower. The game runs twelve turns.\n\nCompleting any row earns a Skyline Complete bonus of +5, any column the Block Built +5, and an entire grid (all sixteen towers) the +10 Megacity bonus. Skipping costs nothing but consumes a turn.\n\nThe original Rolling Heights uses real-world meeple-stacked towers and economic actions; this distillation preserves the building-by-building accumulation while abstracting the height-scoring into a uniform 2-points-per-cell + completion bonuses. Solid runs score 35-45; tight builders hit 55+.\n\nClick. Flip. Stack. The skyline rises one cell at a time, and the city block fills slowly under your careful construction.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as rollingHeightsSettings),
  reducer,
  isTerminal,
  component: rollingHeightsGame,
};
