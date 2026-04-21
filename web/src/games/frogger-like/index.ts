import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FroggerState, FroggerAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Frogger } from "./Frogger.js";

export const froggerSettings = {
  lives: {
    kind: "enum" as const,
    label: "Lives",
    options: ["3", "5"] as const,
    default: "3" as const,
  },
} as const;

type FroggerSettingsType = SettingsOf<typeof froggerSettings>;

export const froggerPlugin: GamePlugin<FroggerState, FroggerAction, typeof froggerSettings> = {
  id: "frogger-like",
  title: "Frog Hop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hop across traffic and water. Reach all 5 home spots without getting squashed or drowned.",
  howToPlay: `Guide your frog from the bottom of the screen to the five home lily-pads at the top without being squashed by traffic or drowning.

Use the Arrow keys or WASD to hop one cell at a time. The board has several zones: a safe start strip at the bottom, three lanes of traffic (rows 4-6), a safe median in the middle, and two water lanes with floating logs near the top. The home row has five spots marked with dotted outlines.

On the road, avoid cars — hopping into one costs a life. On the water, land on a log to ride it safely; hopping onto open water instantly drowns your frog. Logs move continuously, so time your jumps to hop onto them, then ride sideways if needed. If a log carries you off the edge of the screen you lose a life.

Fill all five home spots to win. You start with 3 lives (or 5 on the lives setting). Score = homes reached × 100 minus deaths × 20. Tips: watch the log rhythm before jumping, and plan a path through traffic gaps rather than rushing.`,
  settings: froggerSettings,
  initialState: (seed: number, settings: FroggerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Frogger,
};
