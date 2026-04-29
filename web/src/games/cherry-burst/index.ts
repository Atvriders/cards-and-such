import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CherryBurstState, CherryBurstAction, CherryBurstSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CherryBurstGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cherryBurstPlugin: GamePlugin<CherryBurstState, CherryBurstAction, typeof settings> = {
  id: "cherry-burst", title: "Cherry Burst", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Burst cherries that drift across the screen in 30 seconds.",
  howToPlay: `Cherry Burst is a 30-second clicker arcade. Plump cherries drift across the screen in six lanes; tap them as fast as you can to score 10 points apiece. Cherries last a few ticks before drifting off the screen — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh cherries in random lanes. New cherries appear constantly, so the screen quickly fills up with juicy targets to chase.

There is no skill ceiling: the more cherries you burst in 30 seconds, the higher your score. Average runs land near 200-300 points; sharp tappers pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Burst those cherries and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CherryBurstSettings),
  reducer, isTerminal, component: CherryBurstGame,
};
