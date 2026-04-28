import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkBlueState, RailroadInkBlueAction, RailroadInkBlueSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkBlueGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkBluePlugin: GamePlugin<RailroadInkBlueState, RailroadInkBlueAction, typeof settings> = {
  id: "railroad-ink-blue",
  title: "Railroad Ink: Blue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll route dice and mark a 5x5 map with rail and road segments (water variant).",
  howToPlay: `Railroad Ink is a route-drawing roll-and-write. The Blue (water) edition adds rivers and lakes. In this adaptation you roll 4 dice each turn (each shows one of: rail, road, river, lake) and mark cells on a 5x5 map.

Each turn click any empty cell to mark it with the highest-value face from your latest roll. The cell takes on that segment type.

Scoring (at end):
• Each rail cell adjacent to another rail cell: +1
• Each road cell adjacent to another road cell: +1
• Each river cell in a horizontal or vertical line of 3+: +2 per river
• Each lake cell adjacent to a river cell: +3
• Bonus +5 for filling all corner cells.
• Bonus +5 for filling all 4 edge-midpoint cells.

The game runs 10 rolls (10 cells filled out of 25). Try to chain rails and roads, line up rivers, and place lakes adjacent to rivers. A strong run scores 20-35 points. The map remains partial since you only fill 10 cells; pick high-value placements.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkBlueSettings),
  reducer,
  isTerminal,
  component: RailroadInkBlueGame,
};
