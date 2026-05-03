import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicMazeState, ClassicMazeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClassicMazeGame } from "./Game.js";

export const classicMazeSettings = {
  size: {
    kind: "enum" as const,
    label: "Maze Size",
    options: ["small", "medium", "large"] as const,
    default: "medium" as const,
  },
} as const;

type ClassicMazeSettingsType = SettingsOf<typeof classicMazeSettings>;

export const classicMazePlugin: GamePlugin<ClassicMazeState, ClassicMazeAction, typeof classicMazeSettings> = {
  id: "classic-maze",
  title: "Classic Maze",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a procedurally generated maze from start to finish in as few moves as possible.",
  howToPlay: `Classic Maze generates a fresh, solvable labyrinth every game using a recursive-backtracker algorithm, guaranteeing exactly one path between any two cells with no loops and no dead ends that can't be escaped.

Your yellow dot starts in the top-left corner. The goal is the green G tile in the bottom-right corner. Use the arrow keys or WASD to move one step at a time. You can only pass through open passages — the blue lines are walls you cannot cross.

Three size options change the difficulty: Small gives a 9×9 grid that a patient solver can crack in under a minute; Medium steps up to 13×13 for a moderate challenge; Large produces a sprawling 17×17 labyrinth that rewards systematic exploration.

Your score depends on efficiency — fewer moves earn a higher score. The maze always has a solution, but the optimal path is never obvious from the start. Try to avoid backtracking by memorising which corridors you have already explored.

Every new game produces a completely different layout. Each seed creates a unique puzzle, so no two sessions ever feel the same. Challenge yourself to beat your personal best move count on each size.`,
  settings: classicMazeSettings,
  initialState: (seed: number, settings: ClassicMazeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".classic-maze-svg")) ? { selector: ".classic-maze-svg", pulses: 3 } : null,
  component: ClassicMazeGame,
};
