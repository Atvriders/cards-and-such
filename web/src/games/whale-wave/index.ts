import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WhaleWaveState, WhaleWaveAction, WhaleWaveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WhaleWaveGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const whaleWavePlugin: GamePlugin<WhaleWaveState, WhaleWaveAction, typeof settings> = {
  id:"whale-wave", title:"Whale Wave", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click whale tails surfacing from the deep. 25s clicker.",
  howToPlay:`Whale Wave is a 25-second deep-sea clicker arcade. Whale tails surface and wave from the dark blue ocean in six lanes. Click each tail to greet the whale for 12 points before it dives back into the deep.

The game ticks roughly once per second, spawning fresh whale tails in random lanes. Each tail surfaces for a few ticks before dipping back under. The deep-navy ocean board can quickly fill with surfacing whales — your job is to spot and tap them all in the slightly tighter 25-second window.

Average runs hit around 200-280 points; whale-watching pros can crack 400+. The clock counts down in the top right; when it reaches zero, your final score is locked in.

Each whale tap is worth 12 points (one more than the typical 10) to reward the quicker tempo and tighter timer. Tap, wave, and ride the whale current!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WhaleWaveSettings),
  reducer,isTerminal,component:WhaleWaveGame,
};
