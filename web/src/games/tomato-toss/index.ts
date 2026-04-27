import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TomatoTossState, TomatoTossAction, TomatoTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TomatoTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tomatoTossPlugin: GamePlugin<TomatoTossState, TomatoTossAction, typeof settings> = {
  id:"tomato-toss", title:"Tomato Toss", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click tomatoes before they squish! 30-second clicker arcade.",
  howToPlay:`Tomato Toss is a 30-second tomato-tapping arcade. Tomatoes drift across the screen in six lanes; click each one before it squishes off-screen. Each successful tap scores 10 points.\n\nThe board ticks roughly once per second, spawning fresh tomatoes in random lanes. Each tomato hangs around for a few ticks before disappearing — miss too many and you'll regret it.\n\nThere's no skill ceiling: the more tomatoes you tap in 30 seconds, the higher your score. Average runs land in the 200-300 range; reflex masters can push past 500.\n\nTomatoes are technically fruit, but botanists let them slide — and so will we. Tap fast, score high, and don't let them squish!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TomatoTossSettings),
  reducer,isTerminal,component:TomatoTossGame,
};
