import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriangleMatchState, TriangleMatchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriangleMatch } from "./TriangleMatch.js";

export const triangleMatchSettings = {
  colors: {
    kind: "enum" as const,
    label: "Colors",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

type TriangleMatchSettingsType = SettingsOf<typeof triangleMatchSettings>;

export const triangleMatchPlugin: GamePlugin<TriangleMatchState, TriangleMatchAction, typeof triangleMatchSettings> = {
  id: "triangle-match",
  title: "Triangle Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click groups of 3 or more connected same-color triangles to remove them. Clear as many triangles as possible from the triangular grid.",
  howToPlay: `Triangle Match is played on a triangular pyramid grid made of 64 small triangles arranged in 8 rows — the top row has 1 triangle and each row below adds two more.

Two triangles are considered connected if they share an edge. Up-pointing triangles share their base edge with the down-pointing triangle in the row below. Triangles in the same row share their left or right diagonal edges with their immediate row-neighbors.

Click any triangle to find and remove its connected group — all adjacent triangles of the same color reachable without crossing a differently-colored triangle. A group must contain at least 3 triangles to be removed. Single or isolated pairs cannot be clicked.

Scoring: removing a group of N triangles scores N × (N − 2) × 10 points. Small groups of exactly 3 score 10 points each, but large groups are exponentially more valuable — a group of 8 scores 480 points.

The game ends when no group of 3 or more same-color triangles exists anywhere on the board. Plan your clicks to merge small groups into larger ones before clearing them. Fewer colors means larger groups but also less variety; six colors creates the trickiest puzzle.`,
  settings: triangleMatchSettings,
  initialState: (seed: number, settings: TriangleMatchSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TriangleMatch,
};
