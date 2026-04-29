import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AppleTapState, AppleTapAction, AppleTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AppleTapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const appleTapPlugin: GamePlugin<AppleTapState, AppleTapAction, typeof settings> = {
  id: "apple-tap", title: "Apple Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap red apples that drift across the orchard in 30 seconds.",
  howToPlay: `Apple Tap is a 30-second clicker arcade. Crisp red apples appear in six lanes across an orchard board; tap each apple as fast as you can to score 10 points. Apples linger for a few ticks before drifting away — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh apples in random lanes. The board can quickly fill with juicy targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more apples you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing strong reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Mash that orchard and rack up apples!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AppleTapSettings),
  reducer, isTerminal, component: AppleTapGame,
};
