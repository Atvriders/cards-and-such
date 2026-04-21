import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarkleState, FarkleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Farkle } from "./Farkle.js";

export const farkleSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["5000", "10000"] as const,
    default: "10000",
  },
} as const;

type FarkleSettingsType = SettingsOf<typeof farkleSettings>;

export const farklePlugin: GamePlugin<FarkleState, FarkleAction, typeof farkleSettings> = {
  id: "farkle",
  title: "Farkle",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 6 dice, set aside scoring dice, and bank points before you farkle!",
  settings: farkleSettings,
  initialState: (seed: number, settings: FarkleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Farkle,
};
