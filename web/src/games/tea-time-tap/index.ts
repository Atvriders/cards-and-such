import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TeaTimeTapState, TeaTimeTapAction, TeaTimeTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TeaTimeTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const teaTimeTapPlugin: GamePlugin<TeaTimeTapState, TeaTimeTapAction, typeof settings> = {
  id:"tea-time-tap", title:"Tea Time Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap teacups before they cool. 30-second tea-themed clicker.",
  howToPlay:`Tea Time Tap is a 30-second clicker arcade game. Steaming teacups appear on a six-lane board; tap each cup as fast as you can to drink it for 10 points. Each cup hangs around for a few ticks before it cools and disappears — miss too many and your score will suffer.

The board ticks roughly once per second, spawning fresh teacups in random lanes. The board can quickly fill with hot cuppa targets, so practice your hand-eye coordination and aim carefully — every cup you tap is 10 points closer to a top score.

There's no skill ceiling: the more cups you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharp tappers pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final tally is locked in.

Time for a brew?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TeaTimeTapSettings),
  reducer,isTerminal,component:TeaTimeTapGame,
};
