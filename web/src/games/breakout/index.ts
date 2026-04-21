import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BreakoutState, BreakoutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Breakout } from "./Breakout.js";

export const breakoutSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
  rows: {
    kind: "enum" as const,
    label: "Brick rows",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type BreakoutSettingsType = SettingsOf<typeof breakoutSettings>;

export const breakoutPlugin: GamePlugin<BreakoutState, BreakoutAction, typeof breakoutSettings> = {
  id: "breakout",
  title: "Breakout",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brick-breaker. Bounce the ball, destroy all bricks, don't let it fall.",
  settings: breakoutSettings,
  initialState: (seed: number, settings: BreakoutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Breakout,
};
