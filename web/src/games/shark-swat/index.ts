import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SharkSwatState, SharkSwatAction, SharkSwatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SharkSwatGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sharkSwatPlugin: GamePlugin<SharkSwatState, SharkSwatAction, typeof settings> = {
  id:"shark-swat", title:"Shark Swat", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Swat moving shark fins on the surface. 30s clicker.",
  howToPlay:`Shark Swat is a 30-second oceanic clicker arcade. Shark fins surface and slice through the water in six lanes. Click each fin to swat it down for 10 points before it dives back beneath the waves.

The game ticks roughly once per second, spawning fresh fins in random lanes. Each fin shows for a few ticks before vanishing. The deep-blue ocean board can quickly fill with circling predators — be ready to swat fast.

Average runs hit 200-300 points; expert shark hunters can crack 500. The clock counts down in the top right; when it reaches zero, your final score is locked in.

Stay alert, time your swats, and keep the waters safe! Shark Swat is the perfect arcade between bigger games — tense, fast, and a quick reflex test.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SharkSwatSettings),
  reducer,isTerminal,component:SharkSwatGame,
};
