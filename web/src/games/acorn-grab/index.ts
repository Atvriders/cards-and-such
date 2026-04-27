import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcornGrabState, AcornGrabAction, AcornGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcornGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const acornGrabPlugin: GamePlugin<AcornGrabState, AcornGrabAction, typeof settings> = {
  id:"acorn-grab", title:"Acorn Grab", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch falling acorns drifting through the forest. 30-second clicker.",
  howToPlay:"Acorn Grab is a 30-second forest-themed clicker. Acorns drift across the screen in six lanes; tap each one to grab it for 10 points before it falls off the bottom.\n\nThe game ticks roughly once per second, spawning new acorns in random lanes. Each acorn lingers for a few ticks before vanishing. Quick reflexes and good aim are rewarded — every acorn you snag is 10 points closer to a top score.\n\nThere's no skill ceiling beyond reaction time. Average runs land around 200-300 points; sharpshooters pushing 500+ are showing real squirrel-tier reflexes. The clock counts down in the top right; when it reaches zero, your score locks.\n\nTip: scan the whole board between clicks rather than fixating on one lane. The longer an acorn floats, the older it gets — focus on those before they expire. Mash that screen and rake in the autumn loot!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AcornGrabSettings),
  reducer,isTerminal,component:AcornGrabGame,
};
