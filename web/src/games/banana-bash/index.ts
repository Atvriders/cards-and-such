import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BananaBashState, BananaBashAction, BananaBashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BananaBashGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BananaBashGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const bananaBashPlugin: GamePlugin<BananaBashState, BananaBashAction, typeof settings> = {
  id: "banana-bash", title: "Banana Bash", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bash bananas drifting across the jungle in 30 seconds.",
  howToPlay: `Banana Bash is a 30-second clicker arcade. Ripe yellow bananas drift across the jungle in six lanes; tap them as fast as you can to bash them for 10 points each. Bananas linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh bananas in random lanes. The screen quickly fills with curvy targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more bananas you bash in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Bash those bananas and rule the jungle!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BananaBashSettings),
  reducer, isTerminal,
  hint: (state: BananaBashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-banana-bash-target"]', pulses: 3 };
  },
  component: BananaBashGame,
};
