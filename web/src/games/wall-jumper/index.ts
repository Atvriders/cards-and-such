import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { WallJumperState, WallJumperAction, WallJumperSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WallJumperGame } from "./Game.js";

export const wallJumperSettings = {} as const;

export const wallJumperPlugin: GamePlugin<
  WallJumperState,
  WallJumperAction,
  typeof wallJumperSettings
> = {
  id: "wall-jumper",
  title: "Wall Jumper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bounce between two walls and hit moving colored targets to score points.",
  howToPlay: `Your character clings to one of two vertical walls on either side of the screen. Press any key, tap, or click the button to launch yourself across to the opposite wall.

Colored targets appear on both walls and slide up and down continuously. When you arrive at a wall, any target at roughly the same vertical position as you gets hit and scored. Yellow targets score 1 point, orange targets 2 points, and red targets 3 points.

Timing and vertical positioning are everything. Watch where the high-value targets are sitting as you fly across — you cannot change your Y position during a jump, so you must decide when to launch based on where you want to land vertically.

The player remains at the same Y height throughout a jump (pure horizontal travel). Time your jumps so you meet targets as they pass through your height. Missing too many targets causes a life loss. You start with 3 lives.

Strategy: focus on 3-point red targets but don't be greedy — a well-timed jump at two 1-point targets beats mistiming a jump at one 3-point target. Watch multiple targets at once and anticipate their positions.`,
  settings: wallJumperSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: WallJumperState): HintTarget | null => (!state.over ? { selector: ".arcade-btn", pulses: 3 } : null), component: WallJumperGame,
};
