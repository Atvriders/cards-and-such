import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BatFlyerState, BatFlyerAction, BatFlyerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BatFlyerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const batFlyerPlugin: GamePlugin<BatFlyerState, BatFlyerAction, typeof settings> = {
  id:"bat-flyer", title:"Bat Flyer", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap echolocating bats fluttering through the night.",
  howToPlay:"Bat Flyer is a thirty-second nighttime reflex sprint where you tap echolocating bats fluttering across six dark sky lanes. Each successful tap scores ten points; missed bats age out and count against your accuracy. The night sky ticks roughly once per second, with one or two fresh bats appearing per tick — each bat only stays visible for a few ticks before flapping out of sight. The timer counts down from thirty seconds in the upper-right corner. The moody night-sky aesthetic adds atmosphere, but the gameplay is pure reflex and visual scanning. Average runs net 200-280 points; bat-tracking nightowls regularly clear 360+. Empty-space taps are free of penalty, so aggressive multi-tap attacks are encouraged when many bats appear at once. When the timer hits zero, the sky goes still and your final score is locked in. Sharpen your echolocation and start tapping!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BatFlyerSettings),
  reducer,isTerminal,component:BatFlyerGame,
};
