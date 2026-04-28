import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ScrewGrabState, ScrewGrabAction, ScrewGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ScrewGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const screwGrabPlugin: GamePlugin<ScrewGrabState, ScrewGrabAction, typeof settings> = {
  id:"screw-grab", title:"Screw Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Grab rolling workshop screws before they roll off. 30-second clicker.",
  howToPlay:"Screw Grab is a 30-second workshop-themed clicker. Screws roll loose across six workbench lanes; tap each one as fast as you can to score 10 points per grab. Each screw rolls around a few ticks before disappearing off the bench — miss too many and you've lost good hardware.\\n\\nThe bench ticks roughly once per second, spawning fresh screws in random lanes. Things can pile up fast, so quick eye movement and snappy tapping pay off. There's no skill ceiling: the more screws you grab in 30 seconds, the higher your score.\\n\\nAverage runs land near 200-300 points; nimble fingers pushing 500+ are showing serious shop floor speed. The clock counts down in the top right; when it hits zero, your final score is locked in. Quick hands win the day!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ScrewGrabSettings),
  reducer,isTerminal,component:ScrewGrabGame,
};
