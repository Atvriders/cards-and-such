import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LaserMazeState, LaserMazeAction, LaserMazeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LaserMaze } from "./LaserMaze.js";

export const laserMazeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type LaserMazeSettingsType = SettingsOf<typeof laserMazeSettings>;

export const laserMazePlugin: GamePlugin<LaserMazeState, LaserMazeAction, typeof laserMazeSettings> = {
  id: "laser-maze",
  title: "Laser Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place mirrors to redirect the laser beam from its emitter to the target cell.",
  howToPlay: `Laser Maze is a reflection puzzle played on a 5×5 grid. A laser emitter sits on one edge and fires a beam in a fixed direction. A target cell on the grid must be hit by the beam. Your job is to place a limited number of mirrors so the beam bounces its way to the target.

Two types of mirrors are available. A forward-slash mirror (/) reflects: a beam traveling right turns upward, a beam going left turns downward, a beam going up turns right, and a beam going down turns left. A back-slash mirror (\) reflects: right turns down, down turns right, left turns up, and up turns left. Fixed mirrors (shown in teal) are already placed — you cannot move them, but you can build on their reflections.

Select a mirror type from the tool panel, then click any empty, non-wall cell to place it. Click a placed mirror again to toggle its type, or select Erase and click it to remove it. The beam automatically retraces from the emitter after each change — yellow highlighting shows the current path.

Strategy: trace the beam forward from the emitter and backward from the target. Find where those two paths can be connected with your available mirrors. Note that walls block the beam completely. The beam stops if it hits a wall or exits the grid.`,
  settings: laserMazeSettings,
  initialState: (seed: number, settings: LaserMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LaserMaze,
};
