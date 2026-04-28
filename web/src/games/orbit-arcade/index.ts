import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OrbitArcadeState, OrbitArcadeAction, OrbitArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OrbitArcadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const orbitArcadePlugin: GamePlugin<OrbitArcadeState, OrbitArcadeAction, typeof settings> = {
  id:"orbit-arcade", title:"Orbit Arcade", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap planets orbiting through six stellar lanes.",
  howToPlay:"Orbit Arcade is a thirty-second reflex sprint where planets orbit through six stellar lanes — tap each planet before it leaves orbit to score ten points. Missed planets age out and count against your accuracy. The orbital field ticks about once per second, with one or two fresh planets spawning per tick. Each planet only stays in orbit for a few ticks before drifting away. The timer counts down from thirty seconds in the upper-right corner. With its deep-space dark blue aesthetic, Orbit Arcade is pure reflex stargazing — quick eyes and fast fingers carry the day. Average runs net 220-300 points; cosmic reflex masters routinely score 380+. Empty-space taps are free of penalty, so attack the orbital field aggressively when multiple planets appear at once. When the timer hits zero, the orbits go still and your final score is locked in. Tap the cosmos!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OrbitArcadeSettings),
  reducer,isTerminal,component:OrbitArcadeGame,
};
