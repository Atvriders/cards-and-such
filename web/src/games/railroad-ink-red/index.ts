import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RailroadInkRedState, RailroadInkRedAction, RailroadInkRedSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RailroadInkRedGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const railroadInkRedPlugin: GamePlugin<RailroadInkRedState, RailroadInkRedAction, typeof settings> = {
  id: "railroad-ink-red",
  title: "Railroad Ink: Red",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll route dice with volcanic disruptions; mark a 5x5 rail/road/lava map.",
  howToPlay: `Railroad Ink: Red (Blazing) adds volcanoes and meteors that disrupt your routes. In this adaptation you have 10 rolls of a 4-face die (rail, road, lava, meteor). Each turn click any empty cell on the 5x5 map to mark it with the highest-value face from your latest roll.

Scoring (at end):
• Rail adjacent to rail: +1 each
• Road adjacent to road: +1 each
• Lava: +0 alone, but +5 if no other lava is adjacent (isolated lava is dramatic but contained)
• Meteor: +3 each if placed in any corner cell; +0 elsewhere
• Bonus +10 if your final map has at least 3 of each route type (rail, road, lava, meteor).

The game runs 10 rolls. With only 4 face types, the variety bonus is achievable but not guaranteed. Cluster rails and roads, isolate lavas, and corner the meteors.

A strong Red run scores 25-40 points. The chaos is the charm — every game looks different. Embrace the random map and aim for the bonus by spreading rolls across all four types.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RailroadInkRedSettings),
  reducer,
  isTerminal,
  component: RailroadInkRedGame,
};
