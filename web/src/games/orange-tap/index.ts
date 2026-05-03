import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OrangeTapState, OrangeTapAction, OrangeTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OrangeTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OrangeTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const orangeTapPlugin: GamePlugin<OrangeTapState, OrangeTapAction, typeof settings> = {
  id: "orange-tap", title: "Orange Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap oranges drifting across the grove in 30 seconds.",
  howToPlay: `Orange Tap is a 30-second clicker arcade. Bright oranges drift across the grove in six lanes; tap them as fast as you can to score 10 points each. Oranges linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh oranges in random lanes. The screen quickly fills with citrus targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more oranges you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those oranges and rule the grove!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OrangeTapSettings),
  reducer, isTerminal, 
  hint: (state: OrangeTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".orangetap-target", pulses: 3 };
  },
  component: OrangeTapGame,
};
