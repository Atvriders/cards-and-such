import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GrapePopState, GrapePopAction, GrapePopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GrapePopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const grapePopPlugin: GamePlugin<GrapePopState, GrapePopAction, typeof settings> = {
  id: "grape-pop", title: "Grape Pop", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pop grapes that drift across the vineyard in 30 seconds.",
  howToPlay: `Grape Pop is a 30-second clicker arcade. Plump purple grapes drift across the vineyard in six lanes; tap them as fast as you can to score 10 points each. Grapes linger for a few ticks before drifting off the screen — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh grape clusters in random lanes. The screen quickly fills with juicy targets, so practice your hand-eye coordination.

There is no skill ceiling: the more grapes you pop in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Pop those grapes and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GrapePopSettings),
  reducer, isTerminal, component: GrapePopGame,
};
