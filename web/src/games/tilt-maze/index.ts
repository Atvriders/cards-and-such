import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TiltMazeState, TiltMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TiltMaze = /* @__PURE__ */ lazy(() => import("./TiltMaze.js").then((mod) => ({ default: mod.TiltMaze as unknown as React.ComponentType<unknown> })));
const tiltMazeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const tiltMazePlugin: GamePlugin<TiltMazeState, TiltMazeAction, typeof tiltMazeSettings> = {
  id: "tilt-maze",
  title: "Tilt Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tilt the board to slide the ball into the goal through a maze of walls.",
  howToPlay: `A ball rests on a maze board. When you tilt the board in a direction, the ball slides freely until it hits a wall or the edge of the board.

Click the arrow buttons (or use keyboard arrow keys) to tilt up, down, left, or right. The ball will slide as far as possible in that direction, stopping only when it meets a wall segment or the board edge.

Your goal is to land the ball exactly on the orange goal cell. The ball will glow green when it reaches the goal.

Walls appear as thick dark lines on the edges between cells. Plan your route carefully — you cannot make the ball stop at an arbitrary position; it always slides all the way until blocked.

Tips: Often you need to use walls as intermediate stopping points to reposition the ball before making your final approach to the goal. Try working backward from the goal to find a route. Fewer tilts earn a higher score. On harder puzzles, the board is larger and walls are spaced to require multi-step approaches.`,
  settings: tiltMazeSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-tilt-maze-action"]', pulses: 3 }; },
  component: TiltMaze,
};
