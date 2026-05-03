import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrampolineBounceState, TrampolineBounceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TrampolineBounce = /* @__PURE__ */ lazy(() => import("./TrampolineBounce.js").then((mod) => ({ default: mod.TrampolineBounce as unknown as React.ComponentType<unknown> })));
export const trampolineBounceSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

type TrampolineBounceSettingsType = SettingsOf<typeof trampolineBounceSettings>;

export const trampolineBouncePlugin: GamePlugin<TrampolineBounceState, TrampolineBounceAction, typeof trampolineBounceSettings> = {
  id: "trampoline-bounce",
  title: "Trampoline Bounce",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time your bounces perfectly to keep your jumper flying higher and higher!",
  howToPlay: `Trampoline Bounce is a precision timing game. Your jumper launches off the trampoline and soars into the air. Your job is to hit the bounce button (Space bar, click, or tap) at exactly the right moment to catch them on the way back down.

The screen shows a green highlighted zone near the trampoline surface — that is your target bounce window. When your jumper falls into this green area, press Space or click to trigger a perfect bounce. Hit it right and your jumper springs back into the air with extra power, earning you a point. Miss outside the window and you lose a life.

You start with three lives. Each successful bounce earns points, and the power builds slightly with each consecutive hit. On hard difficulty gravity pulls the jumper down faster, shrinking your reaction time.

Watch the jumper carefully — it turns green when it enters the bounce window. React quickly but not too early. Timing gets trickier as your score climbs because the jumper moves faster.

Lose all three lives and the game ends. Your final score equals the total number of successful bounces you landed. Aim for a clean streak without misses!`,
  settings: trampolineBounceSettings,
  initialState: (seed: number, settings: TrampolineBounceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".trampoline-mat", pulses: 3 }; },
  component: TrampolineBounce,
};
