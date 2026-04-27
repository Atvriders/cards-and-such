import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DumplingDanceState, DumplingDanceAction, DumplingDanceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DumplingDanceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dumplingDancePlugin: GamePlugin<DumplingDanceState, DumplingDanceAction, typeof settings> = {
  id:"dumpling-dance", title:"Dumpling Dance", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click bouncing dumplings on a steamer board for thirty quick seconds.",
  howToPlay:"Dumpling Dance is a 30-second clicker arcade themed around dim sum bamboo steamers. Bouncing dumplings appear in random lanes; tap each one to score 10 points before it skitters off the basket. Each dumpling sticks around for a few ticks before disappearing.\n\nThe game ticks roughly once per second, spawning fresh dumplings in random lanes. The board can fill with juicy targets quickly, so practice your tap accuracy and aim sharp — every dumpling you pop is 10 points closer to a top score.\n\nThere's no skill ceiling: the more dumplings you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nMash that screen and stack up those steamy dumpling points!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DumplingDanceSettings),
  reducer,isTerminal,component:DumplingDanceGame,
};
