import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BubbleBurstArcadeState, BubbleBurstArcadeAction, BubbleBurstArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BubbleBurstArcadeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BubbleBurstArcadeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bubbleBurstArcadePlugin: GamePlugin<BubbleBurstArcadeState, BubbleBurstArcadeAction, typeof settings> = {
  id: "bubble-burst-arcade", title: "Bubble Burst", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Burst floating bubbles drifting across the screen in 30 seconds.",
  howToPlay: `Bubble Burst is a 30-second clicker arcade. Floating bubbles drift across the screen in six lanes; tap them as fast as you can to burst them for 10 points each. Bubbles linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh bubbles in random lanes. The screen quickly fills with shimmering targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more bubbles you burst in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Burst those bubbles and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BubbleBurstArcadeSettings),
  reducer, isTerminal,
  hint: (state: BubbleBurstArcadeState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-bubble-burst-arcade-target"]', pulses: 3 };
  },
  component: BubbleBurstArcadeGame,
};
