import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LanternLiftState, LanternLiftAction, LanternLiftSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LanternLiftGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lanternLiftPlugin: GamePlugin<LanternLiftState, LanternLiftAction, typeof settings> = {
  id:"lantern-lift", title:"Lantern Lift", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Lift floating sky lanterns into the night. 30-second clicker.",
  howToPlay:"Lantern Lift is a serene 30-second clicker arcade. Glowing red sky lanterns drift across a deep-blue evening sky in six lanes; tap each one as fast as you can to lift it for 10 points before it floats out of reach. Each lantern hangs around for a few ticks before drifting beyond the frame \u2014 miss too many and your final tally suffers.\n\nThe board ticks roughly once per second, spawning 1 or 2 fresh lanterns in random lanes. Despite the calm visual, the action is brisk \u2014 your hand-eye coordination determines how high your score climbs.\n\nAverage runs land near 200-300 points; serene-but-swift lantern handlers pushing 500+ are showing real reflex talent. The clock counts down in red at the top right; when it hits zero, your final score is locked in.\n\nInspired by sky-lantern festivals (Yi Peng in Thailand, Pingxi in Taiwan, Mid-Autumn Festival across Asia), this clicker brings a touch of cultural festivity to your screen. Lift every lantern and let your wishes rise!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LanternLiftSettings),
  reducer,isTerminal,component:LanternLiftGame,
};
