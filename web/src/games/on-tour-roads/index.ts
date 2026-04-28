import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OnTourRoadsState, OnTourRoadsAction, OnTourRoadsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OnTourRoadsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const onTourRoadsPlugin: GamePlugin<OnTourRoadsState, OnTourRoadsAction, typeof settings> = {
  id: "on-tour-roads",
  title: "On Tour Roads",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice for tour stops; build the longest connected route on a 4x4 map.",
  howToPlay: `On Tour is a route-building roll-and-write. In this adaptation you have a 4x4 city map (16 cities). Each turn you roll 2 dice: their sum (2-12) is a target city number.

Click any empty cell whose 1-based index (1-16, row-major) is closest to the rolled sum (or any unmarked cell ≤ the rolled sum). The chosen cell becomes a TOUR STOP.

Scoring (at end):
• Each tour stop: +1 base point
• The longest connected chain of orthogonal-adjacent tour stops scores +3 per cell in the chain.
• Bonus +10 if your chain length is ≥ 6
• Bonus +5 per row containing 3+ tour stops
• Penalty −1 per isolated tour stop (no orthogonal neighbor that is also a stop)

The game runs 14 rolls. Aim for one continuous snaking path through the grid. A strong On Tour run scores 25-40 points. Greedy: always extend the existing chain rather than start a new one. Even at the cost of a poor numerical match, connectivity beats fit.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OnTourRoadsSettings),
  reducer,
  isTerminal,
  component: OnTourRoadsGame,
};
