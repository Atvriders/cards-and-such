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
  howToPlay: `Guide the snake to eat food and grow as long as possible without crashing.

Use the arrow keys or WASD to turn the snake. Press Space to pause and resume. Each time the snake eats the red food tile it grows by one segment and a new food tile appears elsewhere on the grid. The game ends immediately if the snake runs into a wall or its own body.

Score equals the current length of the snake — the longer you survive, the higher your score. The grid can be set to 15×15, 20×20, or 25×25. Speed can be slow, medium, or fast. Enable "Walls wrap around" to let the snake pass through walls and emerge on the opposite side, removing the wall-collision threat entirely.

Tips: Plan your path ahead, especially at higher speeds. Favor looping paths that keep the center of the board open. On large grids at slow speed, focus on building length first before attempting riskier maneuvers near your own tail.`,
  settings: snakeSettings,
  initialState: (seed: number, settings: SnakeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Snake,
};
