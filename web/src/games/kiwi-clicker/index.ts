import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KiwiClickerState, KiwiClickerAction, KiwiClickerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KiwiClickerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kiwiClickerPlugin: GamePlugin<KiwiClickerState, KiwiClickerAction, typeof settings> = {
  id: "kiwi-clicker", title: "Kiwi Clicker", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click kiwis that drift across the screen in 30 seconds.",
  howToPlay: `Kiwi Clicker is a 30-second clicker arcade. Ripe green kiwis drift across the screen in six lanes; tap them as fast as you can to score 10 points each. Kiwis linger a few ticks before drifting off — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh kiwis in random lanes. The screen quickly fills with fuzzy targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more kiwis you click in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Click those kiwis and dominate the leaderboard!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KiwiClickerSettings),
  reducer, isTerminal, 
  hint: (state: KiwiClickerState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".kiwiclicker-target", pulses: 3 };
  },
  component: KiwiClickerGame,
};
