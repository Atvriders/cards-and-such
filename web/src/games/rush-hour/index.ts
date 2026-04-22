import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RushHourState, RushHourAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RushHour } from "./RushHour.js";

export const rushHourSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type RushHourSettingsType = SettingsOf<typeof rushHourSettings>;

export const rushHourPlugin: GamePlugin<RushHourState, RushHourAction, typeof rushHourSettings> = {
  id: "rush-hour",
  title: "Rush Hour",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide blocks on a 6×6 grid to guide the red car to the exit.",
  howToPlay: `Rush Hour is a sliding-block puzzle played on a 6×6 grid. A red car (marked →) sits in row 3 and must escape through the exit on the right side of the board. Colored car-shaped blocks fill the grid — each block is either 2 or 3 cells long and slides only along its own axis: horizontal blocks move left and right; vertical blocks move up and down.

To play: click any block to select it (it highlights with a yellow glow). Then use the arrow keys or the Left/Right (or Up/Down) buttons to slide it one cell at a time. A block cannot pass through another block. Your goal is to clear a path so the red car can slide all the way to the exit on the right.

The number of moves is tracked. Score: max(50, 500 − moves × 10). Easier puzzles have fewer blocking cars; harder puzzles require many precise moves to untangle. Plan several steps ahead — sometimes you must move cars that seem unrelated to create a chain of openings. The red car only needs to reach the right wall; it does not need to be in its starting column.`,
  settings: rushHourSettings,
  initialState: (seed: number, settings: RushHourSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: RushHour,
};
