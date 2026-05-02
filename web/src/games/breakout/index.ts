import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BreakoutState, BreakoutAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Breakout } from "./Breakout.js";

export const breakoutSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
  rows: {
    kind: "enum" as const,
    label: "Brick rows",
    options: ["3", "5", "7"] as const,
    default: "5" as const,
  },
} as const;

type BreakoutSettingsType = SettingsOf<typeof breakoutSettings>;

export const breakoutPlugin: GamePlugin<BreakoutState, BreakoutAction, typeof breakoutSettings> = {
  id: "breakout",
  title: "Breakout",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Brick-breaker. Bounce the ball, destroy all bricks, don't let it fall.",
  howToPlay: `Destroy every brick by bouncing the ball off your paddle without letting it fall past the bottom.

Move the paddle left and right using the mouse, or press the arrow keys / A and D. Press Space to release the ball at the start of a round and to pause mid-game. The ball bounces off the walls, the ceiling, and the paddle. Where the ball hits the paddle affects its angle — hitting the edge sends it off at a steeper angle, giving you directional control. Each brick destroyed earns 10 points. You have 3 lives; losing a life resets the ball to the paddle.

Score accumulates from brick hits. Clearing all bricks wins the level and adds a lives × 100 bonus. Difficulty controls ball speed (easy, medium, hard). Brick rows can be set to 3, 5, or 7 — more rows means more bricks and a longer game.

Tips: Keep the ball away from the sides where it can get trapped in a fast diagonal loop. Aim toward brick clusters near the top to break through and let the ball bounce inside the remaining wall for multiple hits. Never let the paddle stop moving — anticipate the ball's trajectory rather than reacting late.`,
  settings: breakoutSettings,
  initialState: (seed: number, settings: BreakoutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BreakoutState): HintTarget | null => {
    if (state.lost || state.won) return null;
    if (!state.started) {
      // Pulse the launch button before the game starts
      return { selector: `[data-testid="hint-target-breakout-launch"]`, pulses: 3 };
    }
    // Pulse the paddle: ball direction guidance
    return { selector: `[data-testid="hint-target-breakout-paddle"]`, pulses: 3 };
  },
  component: Breakout,
};
