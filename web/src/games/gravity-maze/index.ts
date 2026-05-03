import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GravityMazeState, GravityMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GravityMazeGame } from "./Game.js";

export const gravityMazeSettings = {
  puzzle: {
    kind: "enum" as const,
    label: "Puzzle",
    options: ["1", "2", "3", "4", "5"] as const,
    default: "1" as const,
  },
} as const;

type GravityMazeSettingsType = SettingsOf<typeof gravityMazeSettings>;

export const gravityMazePlugin: GamePlugin<GravityMazeState, GravityMazeAction, typeof gravityMazeSettings> = {
  id: "gravity-maze",
  title: "Gravity Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Rotate gravity to guide a ball through a maze to the exit. The ball always falls in the direction of gravity.",
  howToPlay: `Gravity Maze flips traditional navigation on its head. Instead of moving the player directly, you rotate the direction of gravity — and the yellow ball falls automatically until it hits a wall.

Press left arrow (or A) to rotate gravity counter-clockwise. Press right arrow (or D) to rotate clockwise. The ball will immediately slide in the new gravity direction until blocked. Pressing up or down (W/S) makes the ball fall in the current gravity direction without rotating.

The key insight is that each rotation reshapes the entire board from the ball's perspective. A wall that was beside you becomes a floor. Plan your sequence of rotations to guide the ball into the narrow corridors that lead to the green E exit.

Five handcrafted puzzles increase in complexity. Puzzle 1 is an introduction; Puzzle 5 requires careful sequencing of up to a dozen rotations. The same puzzle layout appears every game for a given setting, so you can practise and improve your sequence.

Your score is based on the number of rotations used. Fewer rotations mean higher scores, so find the most efficient gravity sequence to solve each puzzle.`,
  settings: gravityMazeSettings,
  initialState: (seed: number, settings: GravityMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".gravity-maze-svg")) ? { selector: ".gravity-maze-svg", pulses: 3 } : null,
  component: GravityMazeGame,
};
