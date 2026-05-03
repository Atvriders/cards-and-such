import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PumpkinSmashState, PumpkinSmashAction, PumpkinSmashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PumpkinSmashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PumpkinSmashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const pumpkinSmashPlugin: GamePlugin<PumpkinSmashState, PumpkinSmashAction, typeof settings> = {
  id: "pumpkin-smash", title: "Pumpkin Smash", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Smash pumpkins drifting across the patch in 30 seconds.",
  howToPlay: `Pumpkin Smash is a 30-second clicker arcade. Glowing orange pumpkins drift across the patch in six lanes; tap them as fast as you can to smash them for 10 points each. Pumpkins linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh pumpkins in random lanes. The screen quickly fills with grinning targets, so practice your hand-eye coordination.

There is no skill ceiling: the more pumpkins you smash in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Smash those pumpkins and dominate the patch!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PumpkinSmashSettings),
  reducer, isTerminal,
  hint: (state: PumpkinSmashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-pumpkin-smash-target"]', pulses: 3 };
  },
  component: PumpkinSmashGame,
};
