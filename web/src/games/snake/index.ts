import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SnakeState, SnakeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Snake } from "./Snake.js";

export const snakeSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Board size",
    options: ["15", "20", "25"] as const,
    default: "20" as const,
  },
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
  wrap: {
    kind: "boolean" as const,
    label: "Walls wrap around",
    default: false,
  },
} as const;

type SnakeSettingsType = SettingsOf<typeof snakeSettings>;

export const snakePlugin: GamePlugin<SnakeState, SnakeAction, typeof snakeSettings> = {
  id: "snake",
  title: "Snake",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Snake. Eat food, grow, don't hit yourself.",
  settings: snakeSettings,
  initialState: (seed: number, settings: SnakeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Snake,
};
