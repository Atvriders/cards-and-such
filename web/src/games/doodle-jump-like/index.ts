import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { DoodleJumpState, DoodleJumpAction, DoodleJumpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoodleJumpGame } from "./Game.js";

export const doodleJumpSettings = {} as const;

export const doodleJumpPlugin: GamePlugin<
  DoodleJumpState,
  DoodleJumpAction,
  typeof doodleJumpSettings
> = {
  id: "doodle-jump-like",
  title: "Doodle Jumper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bounce automatically on platforms and climb as high as possible.",
  howToPlay: `Guide a small bouncing character upward through an endless series of platforms. The character bounces automatically every time it lands — your job is to steer left and right so it hits the next platform and keeps climbing.

Use the Left and Right arrow keys (or A/D) to move horizontally. On mobile, use the on-screen buttons. The character wraps around the edges — go off the left side and appear on the right, and vice versa.

Platforms are randomly placed but always reachable with good positioning. Look ahead and start drifting toward the next platform before you land. Waiting until the last moment usually means missing and falling.

The camera follows the highest point you reach. If the character falls below the bottom of the screen it is game over. Score is measured in height units — the higher you climb, the better your score.

There are no power-ups or enemies in this version. Pure platforming skill is all that matters. Plan two or three platforms ahead: a missed jump doesn't just cost height, it costs the time to fall back down. Aim for smooth, deliberate lateral movements rather than constant corrections.`,
  settings: doodleJumpSettings,
  initialState: (seed, settings) => initialState(seed, settings),
  reducer, isTerminal, hint: (state: DoodleJumpState): HintTarget | null => (!state.over ? { selector: ".arcade-btn", pulses: 3 } : null), component: DoodleJumpGame,
};
