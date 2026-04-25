import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DesertTrekState, DesertTrekAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DesertTrek } from "./DesertTrek.js";

export const desertTrekSettings = {
  size: {
    kind: "enum" as const,
    label: "Desert Size",
    options: ["5", "6", "7"] as const,
    default: "5" as const,
  },
} as const;

type DesertTrekSettingsType = SettingsOf<typeof desertTrekSettings>;

export const desertTrekPlugin: GamePlugin<DesertTrekState, DesertTrekAction, typeof desertTrekSettings> = {
  id: "desert-trek",
  title: "Desert Trek",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cross the scorching desert grid from camp to finish before your water runs out.",
  howToPlay: `Desert Trek is a survival pathfinding board game set on a baking hot desert grid. You guide a camel (🐪) from the starting camp (🏕️) in the top-left corner to the finish flag (🏁) at the bottom-right, managing your limited water supply along the way.

The desert grid contains several terrain types. Plain sand tiles are free to cross and cost 1 water. Sand dune tiles (⛰️) are impassable walls — you must go around them. Quicksand tiles (🏜️) can be crossed but are costly: they drain 2 water and add 2 moves penalty. Oasis tiles (🌴) are rare bonuses that restore 3 water when you step on them.

You start with 10 water. Each step costs at least 1 water. If your water reaches zero, the trek ends and you score 0. Reaching the finish with water remaining earns a full bonus score.

Use the arrow buttons to move one cell at a time. A guaranteed safe path exists through every generated desert but it may not be the most water-efficient route.

Scoring: reaching the finish earns 200 base points plus 30 per remaining water plus up to 500 move efficiency bonus (500 minus 10 per move). Score is capped at 1000.

Tips: seek out oases early to replenish water. Avoid quicksand unless it saves you from a long detour. Sand dunes are hard walls — plan your route around clusters of them before moving.`,
  settings: desertTrekSettings,
  initialState: (seed: number, settings: DesertTrekSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DesertTrek,
};
