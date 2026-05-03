import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartThrowState, DartThrowAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DartThrow } from "./DartThrow.js";

export const dartThrowSettings = {
  darts: {
    kind: "enum" as const,
    label: "Darts",
    options: ["3", "6", "9"] as const,
    default: "6" as const,
  },
} as const;

type DartThrowSettingsType = SettingsOf<typeof dartThrowSettings>;

export const dartThrowPlugin: GamePlugin<DartThrowState, DartThrowAction, typeof dartThrowSettings> = {
  id: "dart-throw",
  title: "Dart Throw",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click or tap to place your aim on the dartboard, then release to throw. Score the bull's-eye for 50!",
  howToPlay: `Step up to the oche and put your dart-throwing skills to the test. The screen shows a standard dartboard viewed straight-on. To throw, press and hold on the board to set your aim — a yellow crosshair shows where you are targeting. When you release, the dart flies.

Scoring zones from inside out: bull's-eye centre (red dot) scores 50, bull's-eye ring scores 25, then the coloured rings score 20, 15, 10, 5, 3, and 1 point. Darts landing outside all rings score 0.

Each throw has a small random wobble added — even a perfectly aimed dart has natural human variability. This means you cannot guarantee a bull's-eye on every throw, but aiming dead centre gives the best chance. Try to account for your own consistency: if you tend to drift left, aim slightly right to compensate.

Choose 3, 6, or 9 darts per game. The maximum score is 50 × number of darts (all bull's-eyes). A score of 150+ in 6 darts puts you in expert territory. Relax your grip, take a steady breath, aim true, and let it fly!`,
  settings: dartThrowSettings,
  initialState: (seed: number, settings: DartThrowSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".dart-canvas", pulses: 3 }; },
  component: DartThrow,
};
