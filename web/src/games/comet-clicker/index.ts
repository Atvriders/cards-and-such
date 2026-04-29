import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CometClickerState, CometClickerAction, CometClickerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CometClickerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cometClickerPlugin: GamePlugin<CometClickerState, CometClickerAction, typeof settings> = {
  id: "comet-clicker", title: "Comet Clicker", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click comets blazing across deep space in 30 seconds.",
  howToPlay: `Comet Clicker is a 30-second clicker arcade. Bright comets blaze across deep space in six lanes; tap them as fast as you can to score 10 points each. Comets linger a few ticks before vanishing — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh comets in random lanes. The screen quickly fills with fiery targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more comets you click in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Click those comets and dominate the cosmos!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CometClickerSettings),
  reducer, isTerminal, component: CometClickerGame,
};
