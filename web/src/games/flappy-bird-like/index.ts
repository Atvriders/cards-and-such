import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FlappyBirdState, FlappyBirdAction, FlappyBirdSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlappyBirdGame } from "./Game.js";

export const flappyBirdSettings = {} as const;

export const flappyBirdPlugin: GamePlugin<
  FlappyBirdState,
  FlappyBirdAction,
  typeof flappyBirdSettings
> = {
  id: "flappy-bird-like",
  title: "Flappy Bird",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One-button bird flies through pipe gaps. Every pipe passed = 1 point.",
  howToPlay: `Control a small bird navigating an endless series of pipe obstacles. The bird falls constantly due to gravity — your only control is a single tap or button press that gives the bird an upward flap.

Press Space, the Up arrow key, or tap/click the game area to flap. Each flap gives a burst of upward velocity. Time your flaps to thread the bird through the gap between each pair of pipes.

Pipes appear from the right side of the screen at random heights. Each pipe pair has a fixed-size gap — you must fly through that gap without touching the green pipes above or below. You score one point for every pipe pair you successfully pass through.

The game ends instantly if the bird touches any pipe, hits the top of the screen, or falls off the bottom. There is no speed increase — the challenge comes from the gap positions requiring precise timing.

Focus on small, controlled flaps rather than big bursts. If you flap too much you'll hit the ceiling; if you wait too long you'll drop into the lower pipe. Find a rhythm and stay centered. Can you beat 10 pipes? 20? The world record is in the hundreds!`,
  settings: flappyBirdSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FlappyBirdState): HintTarget | null => {
    if (state.over) return null;
    // Determine target gap Y from nearest upcoming pipe (or screen midline)
    const BIRD_X = 0.18;
    let targetY = 0.5;
    let bestDist = Infinity;
    for (const p of state.pipes) {
      if (p.x + 0.075 < BIRD_X) continue; // already passed
      const dist = p.x - BIRD_X;
      if (dist < bestDist) {
        bestDist = dist;
        targetY = p.gapY;
      }
    }
    if (state.birdY > targetY) {
      return { selector: `[data-testid="hint-target-flappy-flap"]`, pulses: 3 };
    }
    return { selector: `[data-testid="hint-target-flappy-canvas"]`, pulses: 3 };
  },
  component: FlappyBirdGame,
};
