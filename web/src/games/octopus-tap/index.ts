import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OctopusTapState, OctopusTapAction, OctopusTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OctopusTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const octopusTapPlugin: GamePlugin<OctopusTapState, OctopusTapAction, typeof settings> = {
  id:"octopus-tap", title:"Octopus Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap drifting octopuses in the deep sea. 30s clicker.",
  howToPlay:`Octopus Tap is a 30-second deep-sea clicker arcade. Octopuses drift across the dark blue ocean in six lanes; tap each one as fast as you can to score 10 points. Each octopus floats around for a few ticks before swimming off into the depths — miss too many and your final score will reflect it.

The game ticks roughly once per second, spawning fresh octopuses in random lanes. The deep blue board can quickly fill with eight-armed cephalopods, so practice your hand-eye coordination and aim carefully.

Average runs land around 200-300 points; expert octopus tappers can crack 500. The clock counts down in the top right; when it reaches zero, your final score is locked in.

Tap fast, tap precise, and keep the deep ocean buzzing!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OctopusTapSettings),
  reducer,isTerminal,component:OctopusTapGame,
};
