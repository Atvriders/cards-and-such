import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PapayaPopState, PapayaPopAction, PapayaPopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PapayaPopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const papayaPopPlugin: GamePlugin<PapayaPopState, PapayaPopAction, typeof settings> = {
  id: "papaya-pop", title: "Papaya Pop", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pop papayas drifting across the tropics in 30 seconds.",
  howToPlay: `Papaya Pop is a 30-second clicker arcade. Ripe orange papayas drift across the tropical board in six lanes; tap them as fast as you can to pop them for 10 points each. Papayas linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh papayas in random lanes. The screen quickly fills with tropical targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more papayas you pop in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Pop those papayas and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PapayaPopSettings),
  reducer, isTerminal, component: PapayaPopGame,
};
