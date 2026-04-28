import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SawSnapState, SawSnapAction, SawSnapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SawSnapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sawSnapPlugin: GamePlugin<SawSnapState, SawSnapAction, typeof settings> = {
  id:"saw-snap", title:"Saw Snap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Snap moving workshop saws. 30-second clicker.",
  howToPlay:"Saw Snap is a 30-second workshop-themed clicker. Hand saws drift across six workbench lanes; tap each one quickly to snap it shut for 10 points per hit. Each saw is exposed for a few ticks before sliding back into its sheath — miss too many and you'll wonder where the wood went.\\n\\nThe bench ticks roughly once per second, spawning fresh saws in random lanes. Things move fast, so keep your taps sharp and accurate. There's no skill ceiling — the more saws you snap in 30 seconds, the higher your final score.\\n\\nAverage runs land near 200-300 points; sharp hands pushing 500+ are showing serious workshop reflexes. The clock counts down in the top right; when it hits zero, your final score is locked in. Snap to it!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SawSnapSettings),
  reducer,isTerminal,component:SawSnapGame,
};
