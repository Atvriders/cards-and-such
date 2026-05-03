import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LightningTapState, LightningTapAction, LightningTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LightningTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LightningTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lightningTapPlugin: GamePlugin<LightningTapState, LightningTapAction, typeof settings> = {
  id: "lightning-tap", title: "Lightning Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap lightning bolts striking across the storm in 30 seconds.",
  howToPlay: `Lightning Tap is a 30-second clicker arcade. Brilliant lightning bolts strike across a stormy sky in six lanes; tap them as fast as you can to score 10 points each. Bolts linger a few ticks before fading — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh bolts in random lanes. The screen quickly fills with electric targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more bolts you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those bolts and light up the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LightningTapSettings),
  reducer, isTerminal, 
  hint: (state: LightningTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".lightningtap-target", pulses: 3 };
  },
  component: LightningTapGame,
};
