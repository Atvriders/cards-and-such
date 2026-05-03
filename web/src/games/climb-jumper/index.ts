import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClimbJumperState, ClimbJumperAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClimbJumper } from "./ClimbJumper.js";

export const climbJumperSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type ClimbJumperSettingsType = SettingsOf<typeof climbJumperSettings>;

export const climbJumperPlugin: GamePlugin<
  ClimbJumperState,
  ClimbJumperAction,
  typeof climbJumperSettings
> = {
  id: "climb-jumper",
  title: "Climb Jumper",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Platform jumper — climb as high as possible by bouncing between platforms.",
  howToPlay: `Guide your jumper as high as possible by bouncing between floating platforms. The screen scrolls upward as you climb, and if you fall off the bottom of the screen the game ends.

Your character jumps automatically every time it lands on a platform — you only control horizontal movement. Hold the Left and Right arrow keys (or A and D) to drift sideways through the air. On touch devices, use the on-screen Left and Right buttons.

Platforms are randomly placed, so each run is different. You must plan ahead: if you drift too far in one direction, you could overshoot the next platform and fall into the gap. Wide platforms are safer; narrow ones require precise positioning. The camera follows your highest point — once a platform scrolls off the bottom, it's gone forever.

Difficulty affects two things: the horizontal move speed and the vertical gap between platforms. Easy gives wider gaps with slower movement, making it forgiving. Hard makes platforms farther apart and the character faster, demanding quick reactions and precise landings. Score equals the peak height reached, multiplied by 100. How high can you go?`,
  settings: climbJumperSettings,
  initialState: (seed: number, settings: ClimbJumperSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".climb-game")) ? { selector: ".climb-game", pulses: 3 } : null,
  component: ClimbJumper,
};
