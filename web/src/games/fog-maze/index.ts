import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FogMazeState, FogMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FogMazeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FogMazeGame as unknown as React.ComponentType<unknown> })));
export const fogMazeSettings = {
  size: {
    kind: "enum" as const,
    label: "Size",
    options: ["small", "large"] as const,
    default: "small" as const,
  },
  visibility: {
    kind: "enum" as const,
    label: "Visibility",
    options: ["near", "far"] as const,
    default: "near" as const,
  },
} as const;

type FogMazeSettingsType = SettingsOf<typeof fogMazeSettings>;

export const fogMazePlugin: GamePlugin<FogMazeState, FogMazeAction, typeof fogMazeSettings> = {
  id: "fog-maze",
  title: "Fog Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a hidden maze through the fog — only nearby cells are revealed as you explore.",
  howToPlay: `Fog Maze challenges your memory as much as your pathfinding. The entire maze is shrouded in darkness at the start. Only the cells within your visibility radius are revealed — and once you move away, those passages remain visible so you can build a mental map.

Your yellow dot begins at the top-left corner. The goal is the green G tile hidden somewhere in the bottom-right corner. Move step by step using arrow keys or WASD to push back the fog and uncover corridors.

Visibility set to Near limits your sight to 2 cells in each direction, making exploration feel tense and uncertain. Far opens up 3 cells around you, giving a little more context but still hiding most of the maze.

The maze itself is procedurally generated and guaranteed to have a solution. Walls are shown in blue as you reveal them. Previously explored areas stay lit, so trust your memory and avoid retreading the same corridors.

Your score rewards efficiency — fewer moves earn more points. The real challenge is committing to a path without being able to see where it leads. Plan ahead, backtrack wisely, and find the exit!`,
  settings: fogMazeSettings,
  initialState: (seed: number, settings: FogMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".fog-maze-svg")) ? { selector: ".fog-maze-svg", pulses: 3 } : null,
  component: FogMazeGame,
};
