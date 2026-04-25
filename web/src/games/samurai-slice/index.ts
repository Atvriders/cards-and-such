import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SamuraiSliceState, SamuraiSliceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SamuraiSlice } from "./SamuraiSlice.js";

export const samuraiSliceSettings = {
  speed: {
    kind: "enum" as const,
    label: "Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
  duration: {
    kind: "enum" as const,
    label: "Duration",
    options: ["30", "60", "90"] as const,
    default: "60" as const,
  },
} as const;

type SamuraiSliceSettingsType = SettingsOf<typeof samuraiSliceSettings>;

export const samuraiSlicePlugin: GamePlugin<SamuraiSliceState, SamuraiSliceAction, typeof samuraiSliceSettings> = {
  id: "samurai-slice",
  title: "Samurai Slice",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slice flying fruit with a tap. Avoid the bombs or lose a life.",
  howToPlay: `Fruit launches upward from the bottom of the screen. Slice it before it falls back down by clicking or tapping on each piece. But watch out — bombs are mixed in! Hitting a bomb costs you a life.

Each fruit sliced earns one point. Letting a fruit fall off the bottom without slicing it also costs a life. You have three lives in total. Slice as much fruit as possible before the timer runs out or you run out of lives.

As time goes on, the fruit spawns more frequently, filling the screen with projectiles to slice. React quickly and aim accurately — you need to tap directly on the fruit or within a short distance of it.

Duration can be set to 30, 60, or 90 seconds. Speed affects how fast fruit launches and how quickly gravity pulls it back down. Slow gives more time to aim; Fast creates fast arcs that demand snap decisions.

Tips: Start by identifying the bombs before slicing. Bombs look distinctly different from fruit. When multiple targets are in the air at once, prioritize those near the top of their arc — they hang in the air the longest, giving you the best window to tap them accurately.`,
  settings: samuraiSliceSettings,
  initialState: (seed: number, settings: SamuraiSliceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: SamuraiSlice,
};
