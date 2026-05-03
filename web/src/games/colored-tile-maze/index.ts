import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ColoredTileMazeState, ColoredTileMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ColoredTileMazeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ColoredTileMazeGame as unknown as React.ComponentType<unknown> })));
export const coloredTileMazeSettings = {
  size: {
    kind: "enum" as const,
    label: "Maze Size",
    options: ["small", "medium"] as const,
    default: "small" as const,
  },
} as const;

type ColoredTileMazeSettingsType = SettingsOf<typeof coloredTileMazeSettings>;

export const coloredTileMazePlugin: GamePlugin<ColoredTileMazeState, ColoredTileMazeAction, typeof coloredTileMazeSettings> = {
  id: "colored-tile-maze",
  title: "Colored Tile Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a maze where colored tiles trigger special effects — bounces, slowdowns, and random teleports!",
  howToPlay: `Colored Tile Maze adds a layer of chaos to classic maze navigation. The corridors are filled with special coloured tiles that each have a unique effect when you walk on them.

Red tiles (marked B) bounce you back to the cell you came from — you can't enter them directly. You must find a route that avoids red tiles entirely or approach them from an angle where the bounce doesn't block progress.

Blue tiles (marked S) slow you down: stepping on one costs 2 moves instead of 1. They are passable but inefficient. Avoid them when possible to keep your score high.

Yellow tiles (marked T) teleport you to a random open cell anywhere in the maze. This could help or hurt — sometimes a lucky jump skips large sections, other times it sends you backwards. Always be prepared to reorient after a teleport.

The green E tile at the bottom-right is your exit. Reach it to win. Use arrow keys or WASD to navigate one cell at a time. The maze is procedurally generated with coloured tiles scattered randomly through the corridors.

Score rewards reaching the exit in as few moves as possible, so plan paths that avoid red blockers and blue slowdowns while being prepared for yellow surprises.`,
  settings: coloredTileMazeSettings,
  initialState: (seed: number, settings: ColoredTileMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".color-maze-svg")) ? { selector: ".color-maze-svg", pulses: 3 } : null,
  component: ColoredTileMazeGame,
};
