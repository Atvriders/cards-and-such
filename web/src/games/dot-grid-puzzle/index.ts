import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DotGridPuzzleState, DotGridPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DotGridPuzzle } from "./DotGridPuzzle.js";

export const dotGridPuzzleSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "5",
  },
} as const;

type DotGridPuzzleSettingsType = SettingsOf<typeof dotGridPuzzleSettings>;

export const dotGridPuzzlePlugin: GamePlugin<DotGridPuzzleState, DotGridPuzzleAction, typeof dotGridPuzzleSettings> = {
  id: "dot-grid-puzzle",
  title: "Dot Grid Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a single continuous path through a grid that visits every marked dot.",
  howToPlay: `Dot Grid Puzzle is a path-drawing logic puzzle. A grid of cells is presented, with some cells marked as required dots. Your goal is to draw a single continuous path that visits every marked dot.

To draw your path: click any cell to start. Then click an adjacent cell (up, down, left, or right — no diagonals) to extend the path one step. Your path is shown in green as you build it. The starting cell is shown in green and the current endpoint in orange.

You may pass through non-dot cells freely — the path does not need to visit every cell, only every marked dot. However, you cannot revisit any cell already in your path.

To backtrack: click the last cell in your path to remove it and step backwards. This lets you correct mistakes without resetting the whole puzzle.

If you get stuck, click Reset Path to start over from scratch without generating a new puzzle. Click New Puzzle to generate a fresh randomly placed set of dots.

The puzzle is solved when your path includes all marked dot cells. Score is based on moves made: fewer moves means a higher score (max around 150 for very efficient solutions).

Tip: look for dots that are far apart and plan the route before clicking. Islands of dots connected only through one passage are high priority.`,
  settings: dotGridPuzzleSettings,
  initialState: (seed: number, settings: DotGridPuzzleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: DotGridPuzzle,
};
