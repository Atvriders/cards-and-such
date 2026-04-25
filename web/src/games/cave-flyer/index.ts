import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CaveFlyerState, CaveFlyerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CaveFlyer } from "./CaveFlyer.js";

export const caveFlyerSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type CaveFlyerSettingsType = SettingsOf<typeof caveFlyerSettings>;

export const caveFlyerPlugin: GamePlugin<CaveFlyerState, CaveFlyerAction, typeof caveFlyerSettings> = {
  id: "cave-flyer",
  title: "Cave Flyer",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fly a helicopter through a winding cave. Hold to thrust up, release to fall.",
  howToPlay: `Guide a helicopter through an endlessly winding cave without crashing into the walls. The helicopter is always moving forward — your only control is whether it climbs or falls.

Hold the Space bar, the Up arrow, or hold your mouse button or finger down on the game area to fire the thrusters and rise. Release to fall under gravity. The cave walls shift up and down as you progress, requiring constant subtle adjustments to stay in the gap.

Your score increases every frame you survive. The higher the score, the further you flew. The cave gap stays the same width but the walls drift more aggressively over time, making it harder to anticipate the upcoming shape.

Three speed settings are available: Slow gives more time to react but the descent is also slower; Medium is the standard experience; Fast makes the helicopter zip through the cave quickly with a steep gravity pull, requiring rapid reactions.

Tips: Try not to overcorrect. A common mistake is holding thrust too long and slamming into the ceiling, then releasing too long and hitting the floor. Aim for small, frequent pulses of thrust to hold the helicopter near the middle of the gap. Watch the upcoming wall shape and start adjusting before you reach it.`,
  settings: caveFlyerSettings,
  initialState: (seed: number, settings: CaveFlyerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: CaveFlyer,
};
