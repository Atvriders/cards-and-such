import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlueberryBurstState, BlueberryBurstAction, BlueberryBurstSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlueberryBurstGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blueberryBurstPlugin: GamePlugin<BlueberryBurstState, BlueberryBurstAction, typeof settings> = {
  id: "blueberry-burst", title: "Blueberry Burst", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Burst blueberries drifting across the bush in 30 seconds.",
  howToPlay: `Blueberry Burst is a 30-second clicker arcade. Plump blueberries drift across the bush in six lanes; tap them as fast as you can to burst them for 10 points each. Blueberries linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh blueberries in random lanes. The screen quickly fills with juicy targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more blueberries you burst in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Burst those berries and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlueberryBurstSettings),
  reducer, isTerminal, component: BlueberryBurstGame,
};
