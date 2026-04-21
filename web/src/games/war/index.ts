import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type WarState, type WarAction } from "./state.js";
import { War } from "./War.js";

export const warSettings = {
  autoPlay: { kind: "boolean" as const, label: "Auto-play whole game", default: false },
} as const;

export const warPlugin: GamePlugin<WarState, WarAction, typeof warSettings> = {
  id: "war",
  title: "War",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Highest card wins each round. Ties mean WAR!",
  settings: warSettings,
  initialState,
  reducer,
  isTerminal,
  component: War,
};
