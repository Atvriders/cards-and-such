import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { MirrorMazeState, MirrorMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MirrorMaze = /* @__PURE__ */ lazy(() => import("./MirrorMaze.js").then((mod) => ({ default: mod.MirrorMaze as unknown as React.ComponentType<unknown> })));
const mirrorMazeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const mirrorMazePlugin: GamePlugin<MirrorMazeState, MirrorMazeAction, typeof mirrorMazeSettings> = {
  id: "mirror-maze",
  title: "Mirror Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place mirrors to redirect a laser beam from the source to the target.",
  howToPlay: `A laser fires from a source cell in the indicated direction. Your goal is to redirect it so it hits the star target cell.

You have a limited set of mirrors to place: "/" mirrors reflect the beam diagonally (north becomes east, east becomes north, south becomes west, west becomes south). "\" mirrors reflect in the other diagonal (north becomes west, west becomes north, south becomes east, east becomes south).

Select a mirror type from the toolbar, then click any empty cell to place it. Click a placed mirror to remove it. Fixed red mirrors are already on the board and cannot be moved.

The laser path is highlighted in yellow as you place mirrors. The puzzle is solved when the laser reaches the star.

Tips: trace the laser path from the source and identify where it needs to turn to reach the target. Work from the target backward to figure out which mirror direction is needed at each bend. On harder puzzles you may need to bounce the beam multiple times through a sequence of mirrors.`,
  settings: mirrorMazeSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".mirror-grid")) ? { selector: ".mirror-grid", pulses: 3 } : null,
  component: MirrorMaze,
};
