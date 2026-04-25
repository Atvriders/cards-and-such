import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TeleportMazeState, TeleportMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TeleportMazeGame } from "./Game.js";

export const teleportMazeSettings = {
  teleporters: {
    kind: "enum" as const,
    label: "Teleporter Pairs",
    options: ["2", "3", "4"] as const,
    default: "2" as const,
  },
} as const;

type TeleportMazeSettingsType = SettingsOf<typeof teleportMazeSettings>;

export const teleportMazePlugin: GamePlugin<TeleportMazeState, TeleportMazeAction, typeof teleportMazeSettings> = {
  id: "teleport-maze",
  title: "Teleport Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a maze with teleporter pads — step on one to instantly warp to its matching partner.",
  howToPlay: `Teleport Maze is a classic labyrinth with a twist: coloured teleporter pads are scattered throughout. When you step onto a pad, you are instantly warped to its matching partner pad elsewhere in the maze.

Each pair of teleporters shares the same number (1, 2, 3…) and the same colour. Walking onto pad 1 takes you to the other pad 1. The teleporter does not activate again immediately — you must move away first before you can use it again, preventing you from getting stuck in a loop.

Your yellow dot starts at the top-left. Reach the green G at the bottom-right to win. Use arrow keys or WASD to move one cell at a time through the passages.

Teleporters can be a shortcut or a setback depending on where they land you. Learning which pad goes where is key — a lucky teleport might skip most of the maze, while accidentally stepping on the wrong one can send you backwards.

Choose 2, 3, or 4 teleporter pairs to increase the chaos. With 4 pairs the maze feels almost like a puzzle of its own as you figure out which jumps help and which hurt. Fewer moves earns a higher score.`,
  settings: teleportMazeSettings,
  initialState: (seed: number, settings: TeleportMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TeleportMazeGame,
};
