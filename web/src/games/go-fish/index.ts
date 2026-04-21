import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type GoFishState, type GoFishAction } from "./state.js";
import { GoFish } from "./GoFish.js";

export const goFishSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const goFishPlugin: GamePlugin<GoFishState, GoFishAction, typeof goFishSettings> = {
  id: "go-fish",
  title: "Go Fish",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ask other players for ranks to collect sets of four.",
  settings: goFishSettings,
  initialState,
  reducer,
  isTerminal,
  component: GoFish,
};
