import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UfoFlyerState, UfoFlyerAction, UfoFlyerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UfoFlyerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ufoFlyerPlugin: GamePlugin<UfoFlyerState, UfoFlyerAction, typeof settings> = {
  id:"ufo-flyer", title:"UFO Flyer", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap UFOs zipping across the sky in lanes.",
  howToPlay:"UFO Flyer is a thirty-second reflex sprint where mysterious UFOs zip across six sky lanes — your job is to tap each saucer before it warps away. Each successful tap is worth ten points; missed UFOs age out and count against your accuracy. The space sky ticks about once per second, with one or two fresh UFOs spawning per tick. Each UFO only stays in view for a few ticks before warping out of sight. The timer counts down from thirty seconds in the upper-right corner. Average runs net 220-300 points; UFO-spotting alien-hunters regularly score 380+. Empty-space taps are free of penalty, so attack the screen aggressively when multiple saucers appear at once. When the timer hits zero, the sky empties and your final score is locked in. UFO Flyer combines a moody sci-fi aesthetic with pure reflex gameplay — keep your eyes peeled and your fingers fast. The truth is out there!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UfoFlyerSettings),
  reducer,isTerminal,component:UfoFlyerGame,
};
