import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoconutCrackState, CoconutCrackAction, CoconutCrackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoconutCrackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const coconutCrackPlugin: GamePlugin<CoconutCrackState, CoconutCrackAction, typeof settings> = {
  id:"coconut-crack", title:"Coconut Crack", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Crack falling coconuts. 30-second clicker.",
  howToPlay:"Coconut Crack is a tropical 30-second clicker arcade. Coconuts drift across the screen in six lanes; tap each one as fast as you can to crack it for 10 points. Each coconut hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh coconuts in random lanes. The board can quickly fill with falling coconuts, so practice your hand-eye coordination and aim carefully — every coconut you crack is 10 points closer to a top score.\n\nThere's no skill ceiling: the more coconuts you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and rack up those coconut points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CoconutCrackSettings),
  reducer,isTerminal,component:CoconutCrackGame,
};
