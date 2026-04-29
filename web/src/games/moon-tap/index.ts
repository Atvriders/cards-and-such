import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MoonTapState, MoonTapAction, MoonTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MoonTapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const moonTapPlugin: GamePlugin<MoonTapState, MoonTapAction, typeof settings> = {
  id: "moon-tap", title: "Moon Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap crescent moons drifting across the night in 30 seconds.",
  howToPlay: `Moon Tap is a 30-second clicker arcade. Glowing crescent moons drift across the night sky in six lanes; tap them as fast as you can to score 10 points each. Moons linger a few ticks before fading away — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh moons in random lanes. The sky quickly fills with silvery targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more moons you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those moons and light up the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MoonTapSettings),
  reducer, isTerminal, component: MoonTapGame,
};
