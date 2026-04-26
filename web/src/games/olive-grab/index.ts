import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OliveGrabState, OliveGrabAction, OliveGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OliveGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const oliveGrabPlugin: GamePlugin<OliveGrabState, OliveGrabAction, typeof settings> = {
  id:"olive-grab", title:"Olive Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab olives from the jar at exactly the right speed for max points!",
  howToPlay:`Olive Grab is a precision picking arcade game. Each round a hidden target power determines the ideal olive-picking speed. Set the slider and press Grab! Points are awarded based on how close your power is to the target up to 100 each round. Ten rounds, 1000 max. Watch the diff feedback carefully after each grab and adjust. Perfect olive-grabbing precision earns the maximum score. Are you the ultimate olive wrangler?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OliveGrabSettings),
  reducer,isTerminal,component:OliveGrabGame,
};
