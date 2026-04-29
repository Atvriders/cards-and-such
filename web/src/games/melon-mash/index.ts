import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MelonMashState, MelonMashAction, MelonMashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MelonMashGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const melonMashPlugin: GamePlugin<MelonMashState, MelonMashAction, typeof settings> = {
  id: "melon-mash", title: "Melon Mash", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mash melons that drift across the field in 30 seconds.",
  howToPlay: `Melon Mash is a 30-second clicker arcade. Ripe melons drift across the field in six lanes; tap them as fast as you can to score 10 points each. Melons linger a few ticks before drifting off — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh melons in random lanes. The board quickly fills with juicy targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more melons you mash in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Mash those melons and dominate the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MelonMashSettings),
  reducer, isTerminal, component: MelonMashGame,
};
