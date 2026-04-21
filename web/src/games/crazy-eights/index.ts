import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CrazyEightsState, CrazyEightsAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrazyEights } from "./CrazyEights.js";

export const crazyEightsSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "2" as const,
  },
  forcePlayAfterDraw: {
    kind: "boolean" as const,
    label: "Must play drawn card if legal",
    default: true,
  },
} as const;

export const crazyEightsPlugin: GamePlugin<
  CrazyEightsState,
  CrazyEightsAction,
  typeof crazyEightsSettings
> = {
  id: "crazy-eights",
  title: "Crazy Eights",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Match the top card by suit or rank. 8s are wild — declare the next suit.",
  settings: crazyEightsSettings,
  initialState,
  reducer,
  isTerminal,
  component: CrazyEights,
};
