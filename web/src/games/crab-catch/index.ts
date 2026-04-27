import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrabCatchState, CrabCatchAction, CrabCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CrabCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const crabCatchPlugin: GamePlugin<CrabCatchState, CrabCatchAction, typeof settings> = {
  id:"crab-catch", title:"Crab Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click sideways-scuttling crabs in 30 seconds. +10 per catch.",
  howToPlay:`Crab Catch is a 30-second click arcade. Crabs scuttle across the sandy beach in six lanes. Click each crab to catch it for 10 points before it scuttles off-screen.

The board ticks roughly once per second, spawning fresh crabs in random lanes. Each crab survives a few ticks before darting off — miss too many and your final score takes a hit. Crabs come fast in waves, so quick reflexes matter.

There's no skill ceiling: the more crabs you catch in 30 seconds, the higher your tally. Average runs land around 200-300 points; sharpshooters cracking 500 are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.

Pinch those clicks and rack up those crabby points!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CrabCatchSettings),
  reducer,isTerminal,component:CrabCatchGame,
};
