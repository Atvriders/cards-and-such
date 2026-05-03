import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MazeChaseState, MazeChaseAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MazeChase = /* @__PURE__ */ lazy(() => import("./MazeChase.js").then((mod) => ({ default: mod.MazeChase as unknown as React.ComponentType<unknown> })));
export const mazeChaseSettings = {
  enemies: {
    kind: "enum" as const,
    label: "Enemies",
    options: ["1", "2", "3"] as const,
    default: "2" as const,
  },
  enemySpeed: {
    kind: "enum" as const,
    label: "Enemy Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type MazeChaseSettingsType = SettingsOf<typeof mazeChaseSettings>;

export const mazeChasePlugin: GamePlugin<MazeChaseState, MazeChaseAction, typeof mazeChaseSettings> = {
  id: "maze-chase",
  title: "Maze Chase",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pac-Man style maze game. Collect all dots while avoiding enemies.",
  howToPlay: `Navigate through a 15×15 maze, collecting every yellow dot while staying out of the enemies' reach.

Use the arrow keys or WASD to set your movement direction. Your character will keep moving in that direction until it hits a wall. To turn a corner, queue up the new direction just before you reach the junction — the turn will happen automatically as soon as the passage opens.

Enemies wander the maze trying to intercept you. They move toward you most of the time, but occasionally take a random turn, so no path is ever completely safe. Collect all dots to win; let an enemy touch you and it's game over.

Settings let you choose 1, 2, or 3 enemies and three speed tiers: slow gives enemies generous reaction time, medium is balanced, and fast makes them nearly as quick as you. Combining 3 fast enemies is the hardest challenge.

Score is 10 points per dot collected, plus a 500-point clear bonus. The maze has 84 dots total. Plan efficient routes through the corridors, keep exits in mind, and never let yourself get cornered. Good luck!`,
  settings: mazeChaseSettings,
  initialState: (seed: number, settings: MazeChaseSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".maze-board")) ? { selector: ".maze-board", pulses: 3 } : null,
  component: MazeChase,
};
