import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaperPlaneMiniState, PaperPlaneMiniAction, PaperPlaneMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaperPlaneMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const paperPlaneMiniPlugin: GamePlugin<PaperPlaneMiniState, PaperPlaneMiniAction, typeof settings> = {
  id:"paper-plane-mini", title:"Paper Plane Mini", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap paper planes drifting through the air.",
  howToPlay:"Paper Plane Mini is a thirty-second reflex sprint where you tap paper planes drifting across six aerial lanes. Each successful tap scores ten points; missed planes age out and count against accuracy. The board ticks about once per second, with one or two fresh paper planes spawning per tick and each plane staying airborne for just a few ticks before drifting off the screen. The timer counts down from thirty seconds in the upper-right corner. With its warm parchment aesthetic and gentle drifting motion, Paper Plane Mini rewards both quick eyes and steady fingers. Average runs land near 220-300 points; plane-spotting paper aviators routinely score 380+. Empty-space taps are free of any penalty, so attack the screen with aggressive multi-taps when many planes appear at once. When the timer hits zero, the board freezes and your final score is locked in. Catch those planes!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PaperPlaneMiniSettings),
  reducer,isTerminal,component:PaperPlaneMiniGame,
};
