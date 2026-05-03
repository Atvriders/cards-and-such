import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MeteorTapState, MeteorTapAction, MeteorTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MeteorTapGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MeteorTapGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const meteorTapPlugin: GamePlugin<MeteorTapState, MeteorTapAction, typeof settings> = {
  id: "meteor-tap", title: "Meteor Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap meteors streaking across the cosmos in 30 seconds.",
  howToPlay: `Meteor Tap is a 30-second clicker arcade. Glowing meteors streak across the cosmos in six lanes; tap them as fast as you can to score 10 points each. Meteors linger a few ticks before burning up — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh meteors in random lanes. The screen quickly fills with fiery targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more meteors you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those meteors and ignite the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MeteorTapSettings),
  reducer, isTerminal, 
  hint: (state: MeteorTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".meteortap-target", pulses: 3 };
  },
  component: MeteorTapGame,
};
