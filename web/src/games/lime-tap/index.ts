import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LimeTapState, LimeTapAction, LimeTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LimeTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LimeTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const limeTapPlugin: GamePlugin<LimeTapState, LimeTapAction, typeof settings> = {
  id: "lime-tap", title: "Lime Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap limes drifting through the citrus grove in 30 seconds.",
  howToPlay: `Lime Tap is a 30-second clicker arcade. Vivid green limes drift across the citrus grove in six lanes; tap them as fast as you can to score 10 points each. Limes linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh limes in random lanes. The screen quickly fills with zesty targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more limes you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those limes and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LimeTapSettings),
  reducer, isTerminal, 
  hint: (state: LimeTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".limetap-target", pulses: 3 };
  },
  component: LimeTapGame,
};
