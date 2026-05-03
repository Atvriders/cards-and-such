import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BouncerState, BouncerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Bouncer } from "./Bouncer.js";

export const bouncerSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Ball Speed",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5", "10"] as const,
    default: "3" as const,
  },
} as const;

type BouncerSettingsType = SettingsOf<typeof bouncerSettings>;

export const bouncerPlugin: GamePlugin<BouncerState, BouncerAction, typeof bouncerSettings> = {
  id: "bouncer",
  title: "Bouncer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Keep the ball alive with your paddle. Collect power-ups every 10 bounces.",
  howToPlay: `Bouncer is a pure survival game — there are no bricks to break. Instead, your only job is to keep the ball bouncing by intercepting it with your paddle at the bottom. Every successful bounce earns one point. The ball can bounce as long as you keep it in play, so the ceiling on your score is only your skill.

Move the paddle with the mouse, or press A and D (or the left and right arrow keys). Press Space to launch the ball at the start and to pause mid-game. Where the ball hits the paddle affects its angle — hitting the edge sends it off at a steeper diagonal.

Every 10 successful bounces a power-up capsule drops from somewhere above. Steer the paddle to catch it. Three power-ups can appear: the green 2x capsule spawns a second ball (two balls means twice the catching challenge — and double the scoring chances); the blue SLO capsule slows the ball down for about five seconds; the orange WDE capsule widens your paddle significantly.

You lose a life each time the ball escapes off the bottom of the screen. Lose all your lives and it is game over. On hard difficulty the ball moves very fast, so reflexes and anticipation are essential. The score is simply the total count of paddle hits across the entire game.`,
  settings: bouncerSettings,
  initialState: (seed: number, settings: BouncerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".bouncer-game")) ? { selector: ".bouncer-game", pulses: 3 } : null,
  component: Bouncer,
};
